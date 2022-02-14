# Solid Windowed

Given a list of items, only render what's visible on the screen while allowing scrolling the whole list.

## Usage

Use in the same way as a solid `For` https://www.solidjs.com/docs/latest/api#%3Cfor%3E

## Install

`npm install https://github.com/titoBouzout/solid-windowed.git`

```jsx
import Windowed from 'solid-windowed'

let list = []
for (let i = 0; i < 250_000; i++) list.push(i)

export default function YourComponent() {
	return (
		<div style="height:100%;">
			<Windowed each={list}>
				{(value, idx) => {
					return (
						<div>
							Index in list is {idx}, value is: {value}
						</div>
					)
				}}
			</Windowed>
		</div>
	)
}
```

## How it works?

It renders the first 10 elements of the list, then averages the height and with that in mind, we get the height of the container and render N items. As you scroll we slice the list to show what's supposed to be visible.

## Bugs

- When scrolling to the bottom of the list, if you overscroll, you will have to overscroll back to be able to scroll up again.

## Author

- https://github.com/titoBouzout

## URL

- https://github.com/titoBouzout/solid-windowed
