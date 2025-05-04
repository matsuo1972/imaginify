import { WebhookEvent } from "@clerk/backend";
import { NextResponse } from "next/server";

import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";
import { createClerkClient } from "@clerk/backend";
import { headers } from "next/headers";
import { Webhook } from "svix";

export async function POST(req: Request) {
	console.log("POST called");
	// You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
	const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
	const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
	console.log("WEBHOOK_SECRET = ", WEBHOOK_SECRET);
	if (!WEBHOOK_SECRET) {
		throw new Error(
			"Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
		);
	}

	// Get the headers
	const headerPayload = await headers();
	const svix_id = headerPayload.get("svix-id");
	const svix_timestamp = headerPayload.get("svix-timestamp");
	const svix_signature = headerPayload.get("svix-signature");

	// If there are no headers, error out
	if (!svix_id || !svix_timestamp || !svix_signature) {
		return new Response("Error occured -- no svix headers", {
			status: 400,
		});
	}

	// console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
	// console.log('Webhook payload:', evt.data)

	// Get the body
	const payload = await req.json();
	const body = JSON.stringify(payload);

	// const event = await verifyWebhook(payload);

	// Do something with payload
	// For this guide, log payload to console
	// const { id } = event.data;
	// const eventType = event.type;
	// console.log("id = ", id);
	// console.log("eventType = ", eventType);

	// Create a new Svix instance with your secret.
	const wh = new Webhook(WEBHOOK_SECRET);

	let evt: WebhookEvent;

	// Verify the payload with the headers
	try {
		evt = wh.verify(body, {
			"svix-id": svix_id,
			"svix-timestamp": svix_timestamp,
			"svix-signature": svix_signature,
		}) as WebhookEvent;
	} catch (err) {
		console.error("Error verifying webhook:", err);
		return new Response("Error occured", {
			status: 400,
		});
	}

	console.log("evt = ", evt);
	console.log("evt.data = ", evt.data);

	// // Get the ID and type
	const { id } = evt.data;
	const eventType = evt.type;

	console.log("id = ", id);
	console.log("eventType = ", eventType);

	// CREATE
	if (eventType === "user.created") {
		console.log("user.created");
		const {
			id,
			email_addresses,
			image_url,
			first_name,
			last_name,
			username,
		} = evt.data;

		const user = {
			clerkId: id,
			email: email_addresses[0].email_address,
			username: username!
				? username
				: email_addresses[0]?.email_address.split("@")[0],
			firstName: first_name ?? "",
			lastName: last_name ?? "",
			photo: image_url,
		};

		console.log("user = ", user);

		if (!user) {
			console.log("user not found");
			throw new Error("user not found!");
		}

		const newUser = await createUser(user);
		console.log("newUser = ", newUser);

		const clerkClient = createClerkClient({ secretKey: CLERK_SECRET_KEY });

		// Set public metadata
		if (newUser) {
			console.log("更新するユーザーID:", id);

			console.log("updateUserMetadata");
			await clerkClient.users.updateUserMetadata(id, {
				publicMetadata: {
					userId: newUser._id,
				},
			});
		}

		return NextResponse.json({ message: "OK", user: newUser });
	}

	// UPDATE
	if (eventType === "user.updated") {
		console.log("update case");
		const {
			id,
			image_url,
			email_addresses,
			first_name,
			last_name,
			username,
		} = evt.data;

		const user = {
			firstName: first_name ?? "",
			lastName: last_name ?? "",
			username: username!
				? username
				: email_addresses[0]?.email_address.split("@")[0],
			photo: image_url,
		};
		console.log("user = ", user);

		const updatedUser = await updateUser(id, user);
		console.log("updatedUser = ", updatedUser);
		return NextResponse.json({ message: "OK", user: updatedUser });
	}

	// DELETE
	if (eventType === "user.deleted") {
		console.log("deleteUser");
		const { id } = evt.data;
		console.log("evt.data = ", evt.data);
		if (!id) {
			throw new Error("User id is missing in event data");
		}
		const deletedUser = await deleteUser(id);
		console.log("deletedUser = ", deletedUser);
		return NextResponse.json({ message: "OK", user: deletedUser });
	}

	console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
	console.log("Webhook body:", body);

	return new Response("", { status: 200 });
}
