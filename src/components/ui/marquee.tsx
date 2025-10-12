export default function Marquee({ items }: { items: string[] }) {
	return (
		// Removed border t here to not overlap with header but this is a short term solution
		<div className="relative flex w-full overflow-x-hidden border-border border-b-4 bg-secondary-background font-base text-foreground">
			<div className="animate-marquee whitespace-nowrap py-2">
				{items.map((item) => {
					return (
						<span key={item} className="mx-2 text-base">
							{item}
						</span>
					);
				})}
			</div>

			<div className="absolute top-0 animate-marquee2 whitespace-nowrap py-2">
				{items.map((item) => {
					return (
						<span key={item} className="mx-2 text-base">
							{item}
						</span>
					);
				})}
			</div>

			{/* must have both of these in order to work */}
		</div>
	);
}
