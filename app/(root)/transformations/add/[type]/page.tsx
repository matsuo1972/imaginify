import Header from "@/components/shared/Header";
import TransformationForm from "@/components/shared/TransformationForm";
import { transformationTypes } from "@/constants";
import { getUserById } from "@/lib/actions/user.actions";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// 型定義
type TransformationTypeKey =
	| "restore"
	| "fill"
	| "remove"
	| "recolor"
	| "removeBackground";

// Next.js 15.3.1に合わせた型定義
// PagePropsインターフェースに適合させるために、paramsをPromiseとして定義
type PageParams = {
	params: Promise<{ type: string }>;
};

export default async function AddTransformationTypePage({
	params,
}: PageParams) {
	// 認証情報を取得
	const { userId } = await auth();

	// 未認証の場合はリダイレクト
	if (!userId) redirect("/sign-in");

	// paramsを解決
	const resolvedParams = await params;
	const transformationType = resolvedParams.type as TransformationTypeKey;

	// 変換タイプが有効かチェック
	if (!transformationTypes[transformationType]) {
		// 無効な変換タイプの場合はリダイレクト
		redirect("/transformations");
	}

	const transformation = transformationTypes[transformationType];

	// ユーザー情報を取得
	const user = await getUserById(userId);

	return (
		<>
			<Header
				title={transformation.title}
				subTitle={transformation.subTitle}
			/>

			<section className="mt-10">
				<TransformationForm
					action="Add"
					userId={user._id}
					type={transformation.type as TransformationTypeKey}
					creditBalance={user.creditBalance}
				/>
			</section>
		</>
	);
}
