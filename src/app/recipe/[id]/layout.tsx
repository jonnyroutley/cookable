export default function RecipeLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen ">
			<div className="container mx-auto max-w-2xl p-4">{children}</div>
		</div>
	);
}
