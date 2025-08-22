export default function Loading({
	backgroundClass,
}: {
	backgroundClass: string;
}) {
	return (
		<div
			className={`min-h-screen w-full ${backgroundClass} relative text-white`}
		>
			<div className="absolute inset-0 z-0 pointer-events-none opacity-95" />
			<div className="relative z-10 px-3 lg:px-4 py-4 lg:py-6">
				<div className="flex gap-3 lg:gap-4">
					<div className="flex-1 min-w-0 flex flex-col h-[calc(100vh-2rem)] lg:h-[calc(100vh-3rem)] overflow-hidden">
						<div className="flex items-center justify-center h-full">
							<div className="text-white/60">Loading...</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
