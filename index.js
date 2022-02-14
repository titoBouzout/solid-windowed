import { createMutable } from 'solid-js/store'
import { onMount, onCleanup } from 'solid-js'

let scrollbar
let container
let nodes

let list = []
let start = 0
let end = 10
let itemHeight = 0

let state = createMutable({
	filtered: [],
	height: 3000,
	top: 0,
})

const updateHeight = () => {
	// calculate the avg height of the list of items
	// takes as reference the first 10 items the first time
	itemHeight =
		Array.from(nodes.childNodes).reduce((a, b) => a + b.getBoundingClientRect().height, 0) /
		nodes.childNodes.length

	// calculate how many items can we display at a time
	end = Math.ceil(scrollbar.getBoundingClientRect().height / itemHeight)

	// set the overflow
	state.height = itemHeight * list.length

	// update the list with the new number and ofsset of rows
	updateList()
}

// update the list with the new number and ofsset of rows
const updateList = () => {
	let scrollTop = scrollbar.scrollTop
	start = Math.ceil(scrollTop / itemHeight)

	// if end overflows, get the last N items
	state.filtered =
		start + end > list.length - end ? list.slice(-end) : list.slice(start, start + end)

	// I have a bug here, when scrolling to the very bottom of the list.
	// it cakes a while to scrollbar for some reason
	state.top = scrollTop > state.height ? state.height : scrollTop | 0
}

export default function Windowed(props) {
	list = props.each

	// start with 10 and update when the avg height is calculated
	state.filtered = list.slice(start, end)

	// on window resize the list should update
	let debounce
	let onResize = () => {
		clearTimeout(debounce)
		debounce = setTimeout(updateHeight, 80)
	}

	// on mount the list should update
	onMount(() => {
		window.addEventListener('resize', onResize)
		updateHeight()
	})
	onCleanup(() => window.removeEventListener('resize', onResize))

	return (
		<div ref={scrollbar} style="height:100%;overflow-y:auto;" onScroll={updateList}>
			<div
				ref={container}
				style={`height:${state.height}px;max-height:${state.height}px;transform:translate3d(0,0,0);`}
			>
				<div ref={nodes} style={`position:fixed;top:${state.top}px;`}>
					<For each={state.filtered}>{(item, idx) => props.children(item, idx() + start)}</For>
				</div>
			</div>
		</div>
	)
}
