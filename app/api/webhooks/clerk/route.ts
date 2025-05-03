import { createClerkClient, WebhookEvent } from "@clerk/backend";
import { NextResponse } from "next/server";

import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";
import { headers } from "next/headers";
import { Webhook } from "svix";

export async function POST(req: Request) {
	// You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
	const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

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

	// // Get the ID and type
	const { id } = evt.data;
	const eventType = evt.type;

	// CREATE
	if (eventType === "user.created") {
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
			username: username!,
			firstName: first_name,
			lastName: last_name,
			photo: image_url,
		};

		if (!user) {
			console.log("user not found");
			throw new Error("user not found!");
		}
		if (!user.firstName || !user.lastName) {
			console.log("first name is empty");
			throw new Error("first name is empty");
		}

		const newUser = await createUser(user as CreateUserParams);
		console.log("newUser = ", newUser);

		const clerkClient = createClerkClient({ secretKey: WEBHOOK_SECRET });
		// Set public metadata
		if (newUser) {
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
		const { id, image_url, first_name, last_name, username } = evt.data;

		const user = {
			firstName: first_name,
			lastName: last_name,
			username: username!,
			photo: image_url,
		};
		console.log("user = ", user);

		const updatedUser = await updateUser(id, user as CreateUserParams);
		console.log("updatedUser = ", updatedUser);
		return NextResponse.json({ message: "OK", user: updatedUser });
	}

	// DELETE
	if (eventType === "user.deleted") {
		console.log("deleteUser");
		const { id } = evt.data;

		const deletedUser = await deleteUser(id!);
		console.log("deletedUser = ", deletedUser);
		return NextResponse.json({ message: "OK", user: deletedUser });
	}

	console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
	console.log("Webhook body:", body);

	return new Response("", { status: 200 });
}
