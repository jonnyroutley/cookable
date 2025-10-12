import Link from "next/link";

const quotations = [
	"If it tastes really good, and it's funky, it's funkalicous. If the guy making it is funky, he's funkintacious.",
	"There are three people you need in life: an accountant, a fishmonger, and a bail bondsman.",
	"The Tom Brady sandwich would be a prosciutto with a nice Buffalo mozzarella, on a crispy baguette with a little fresh basil. Brady is classy; he's a really cool dude. He's got a lot of flavor.",
	"My parents were all into macrobiotic cooking and natural cooking, and my sister was a vegetarian. I wasn't down with that.",
	"I'm a huge kale fan.",
	"It's always good to go over the recipe beforehand, so you can easily think of the next thing that needs to be done.",
	"You can find tranquility, you can find party, you can find new friends. I'm a cruise convert.",
	"I don't eat sweets. I'm not a big dessert guy.",
	"I can't bake anything. I'm the worst. My cakes always come out flat.",
];

export const GuyFieriQuotation = () => {
	const randomIndex = Math.floor(Math.random() * quotations.length);
	const selected = quotations[randomIndex];
	return (
		<div className="flex flex-col items-center text-center">
			<p className="italic">
				"{selected}"{" "}
				<Link
					href="https://mediaproxy.tvtropes.org/width/1200/https://static.tvtropes.org/pmwiki/pub/images/guyfieri.jpg"
					className="font-bold underline hover:text-main"
				>
					~ Guy Fieri
				</Link>
			</p>
		</div>
	);
};
