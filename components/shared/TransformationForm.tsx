"use client";

import { Form } from "@/components/ui/form";
import { defaultValues } from "@/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "../ui/input";
import { CustomField } from "./CustomField";

export const formSchema = z.object({
	title: z.string(),
	aspectRatio: z.string().optional(),
	color: z.string().optional(),
	prompt: z.string().optional(),
	publicId: z.string(),
});

const TransformationForm = ({
	action,
	data = null,
}: TransformationFormProps) => {
	const initialValues =
		data && action === "Update"
			? {
					title: data?.title,
					aspectRatio: data?.aspectRatio,
					color: data?.color,
					prompt: data?.prompt,
					publicId: data?.publicId,
			  }
			: defaultValues;

	function onSubmit(values: z.infer<typeof formSchema>) {
		console.log(values);
	}

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: initialValues,
	});
	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<CustomField
					control={form.control}
					name="title"
					formLabel="Image Title"
					className="w-full"
					render={({ field }) => (
						<Input
							value={field.value}
							onChange={field.onChange}
							onBlur={field.onBlur}
							name={field.name}
							ref={field.ref}
							className="input-field"
						/>
					)}
				/>
			</form>
		</Form>
	);
};

export default TransformationForm;
