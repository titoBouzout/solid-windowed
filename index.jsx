import { createMutable, unwrap } from 'solid-js/store'
import { onMount, onCleanup, createEffect } from 'solid-js'

// DOM elements
let scrollbar
let container
let nodes

// local vars
let list = []
let start = 0
let end = 10

// cached heights
let childHeight = 0
let scrollbarHeight = 0

// state
let state = createMutable({
	filtered: [],
	height: '100%',
	top: 0,
})

// util
const getFullHeight = el => {
	let s = window.getComputedStyle(el)
	return el.offsetHeight + parseFloat(s.marginTop) + parseFloat(s.marginBottom)
}

// recalculates heights of childs and container, on resize and on mount
const updateHeights = () => {
	// gets the average height of the childs(list of items)
	// it takes as reference the first 10 items(if enough) the first time it renders
	// this is just an aproximation and if theres a need to add more elements we add them
	childHeight = getFullHeight(nodes) / nodes.childNodes.length

	// sets the overflow
	// this is just an aproximation
	// we only calculate the real value when we are near the end of the list
	state.height = childHeight * list.length + 'px'

	// cache the scrollbar size
	scrollbarHeight = scrollbar.getBoundingClientRect().height

	update()
}

// update the list, with the new number of rows and their offset
// it runs while scrolling, and when the window is resized
const update = () => {
	let scrollTop = scrollbar.scrollTop
	start = Math.ceil(scrollTop / childHeight)

	// how many items can we display at a time?
	end = Math.ceil(scrollbarHeight / childHeight)

	// trigger reactivity as little as possible (getters/setters)
	let top = 0
	let height = parseInt(state.height)

	// if `start + end` overflows, get the last N items
	if (start + end > list.length) {
		start = list.length - end
		// as we are in the end, we need the real value
		top = scrollbar.scrollHeight - getFullHeight(nodes) //.getBoundingClientRect().height
	} else {
		top = scrollTop
	}

	// fix:when a window is maximimed, after being small enough
	if (top > height) {
		top = height
	}

	// trigger reactivity
	state.top = top
	state.filtered = list.slice(start, start + end)
}

export default function Windowed(p) {
	// just in case, work with the list unwraped
	list = unwrap(p.each)

	// start with 10 to know the average height of the childs
	state.filtered = list.slice(start, end)

	// in case we didnt fill the container, render more items
	createEffect(() => {
		if (state.filtered) {
			if (getFullHeight(nodes) < scrollbarHeight) {
				if (end + 1 < list.length) {
					end++
					state.filtered = list.slice(start, start + end)
				}
			}
		}
	})

	// on window resize, the list should update
	// use `debounce` to not recalculate at every pixel change
	let debounce
	let onResize = () => {
		clearTimeout(debounce)
		debounce = setTimeout(updateHeights, 50)
	}

	// on mount the height must be calculated
	// we should also listen for resize
	onMount(() => {
		window.addEventListener('resize', onResize)
		updateHeights()
	})
	// on onCleanup the resize listener must be removed
	onCleanup(() => window.removeEventListener('resize', onResize))

	return (
		/* provides the scrollbar */
		<div ref={scrollbar} onScroll={update} style="height:100%;overflow-y:auto;">
			{/* provides the overflow, by setting the height to the expected amount. */}
			<div ref={container} style={`height:${state.height};position:relative;`}>
				{/* the actual list container */}
				<div ref={nodes} style={`position:absolute;top:${state.top}px;`}>
					<For each={state.filtered}>{(item, idx) => p.children(item, () => idx() + start)}</For>
				</div>
			</div>
		</div>
	)
}
