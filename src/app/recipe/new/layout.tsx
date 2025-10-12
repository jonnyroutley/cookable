export default function NewRecipeLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="bg-[linear-gradient(to_right,#8080804D_1px,transparent_1px),linear-gradient(to_bottom,#80808090_1px,transparent_1px)] bg-[size:40px_40px]">
			{children}
		</div>
	);
}
