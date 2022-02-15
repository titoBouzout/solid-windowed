import { createMutable } from 'solid-js/store'
import { onMount, onCleanup } from 'solid-js'

// DOM elements
let scrollbar
let container
let nodes

// local vars
let list = []
let start = 0
let end = 10
let childHeight = 0

// state reactive vars
let state = createMutable({
	filtered: [],
	height: '100%',
	top: 0,
})

// recalculates on resize and on mount
const updateChildHeight = () => {
	// gets the average height of the childs(list of items)
	// it takes as reference the first 10 items(if enough) the first time it renders
	childHeight =
		Array.from(nodes.childNodes).reduce((a, b) => {
			let s = window.getComputedStyle(b)
			return a + b.offsetHeight + parseFloat(s.marginTop) + parseFloat(s.marginBottom)
		}, 0) / nodes.childNodes.length

	// how many items can we display at a time?
	end = Math.ceil(scrollbar.getBoundingClientRect().height / childHeight)

	// sets the overflow
	state.height = childHeight * list.length

	updateList()
}

// update the list, with the new number of rows and their offset
// it runs while scrolling, and when the window is resized
const updateList = () => {
	let scrollTop = scrollbar.scrollTop
	start = Math.ceil(scrollTop / childHeight)

	// calculate how many items can we display at a time
	// there's a bug here setting the end, our index() could overflow(or report incorrect)
	// this could easily be fixed by setting a Symbol with the index to the Array
	// but I would prefer to fix the underlying issue when scrolling to the bottom of the list
	end = Math.ceil(scrollbar.getBoundingClientRect().height / childHeight)

	// if `end` overflows, get the last N items
	state.filtered = start + end > list.length ? list.slice(-end) : list.slice(start, start + end)

	// I have a bug here, when scrolling to the very bottom of the list.
	// seems to me that pushing the list lower makes the div get more height, but Im still not sure.
	// it takes a while to "scrollback", if you "overscroll", for some reason..
	state.top = scrollTop > state.height ? state.height : scrollTop | 0
}

export default function Windowed(props) {
	list = props.each

	// start with 10 to know the average height of the childs
	state.filtered = list.slice(start, end)

	// on window resize, the list should update
	// use `debounce` to not recalculate as every pixel change
	let debounce
	let onResize = () => {
		clearTimeout(debounce)
		debounce = setTimeout(updateChildHeight, 80)
	}

	// on mount the height must be calculated
	// we should listen for resize
	onMount(() => {
		window.addEventListener('resize', onResize)
		updateChildHeight()
	})
	// on onCleanup the resize listener must be removed
	onCleanup(() => window.removeEventListener('resize', onResize))

	return (
		/* element to provide the scrollbar */
		<div ref={scrollbar} style="height:100%;overflow-y:auto;" onScroll={updateList}>
			{/*
				element to provide the overflow, to make the scrollbar scroll at all by setting the height to the ridiculous expected amount.
				It also gives `transform:translate3d(0,0,0)` so the child can use `position:fixed` to position itself relative to the parent, using `top:Npx`,
			*/}
			<div
				ref={container}
				style={`height:${
					typeof state.height == 'string' ? state.height : state.height + 'px'
				};transform:translate3d(0,0,0);`}
			>
				{/* the actual list container. Notice `position:fixed` works relative to the parent, because of the `translate3d` CSS property */}
				<div ref={nodes} style={`position:fixed;top:${state.top}px;`}>
					<For each={state.filtered}>
						{(item, idx) => props.children(item, () => idx() + start)}
					</For>
				</div>
			</div>
		</div>
	)
}
