# Solid Windowed

Given a list of items, only render what's visible on the screen while allowing scrolling the whole list.

A Solid component. See https://www.solidjs.com/

## Usage

Use in the same way as a solid `For`. Please see: https://www.solidjs.com/docs/latest/api

```jsx
import Windowed from 'solid-windowed'

let list = []
for (let i = 0; i < 250_000; i++) list.push(i)

export default function YourComponent() {
	return (
		<div style="height:100%;">
			<Windowed each={list}>
				{(value, index) => {
					return (
						<div>
							Index in list is {index}, value is: {value}
						</div>
					)
				}}
			</Windowed>
		</div>
	)
}
```

## Install

`npm install https://github.com/titoBouzout/solid-windowed.git`

or

`npm install solid-windowed`

## How it works?

It renders the first 10 elements of the list, then averages the height and with that in mind, we get the height of the container and render N items. As you scroll we slice the list to show what's supposed to be visible. If our average didn't fill the whole available space, we will add more items till its filled.

## Caveats

- You are responsible for setting the height of the container item. Child will be 100%. For example using this component on the `body` and having `<!DOCTYPE html>` will require to set the `height` of `html` and `body` to 100%. See https://github.com/titoBouzout/solid-windowed/issues/2 and https://stackoverflow.com/questions/32214152/why-does-height-100-work-when-doctype-is-removed

## Alternatives

I started this project without knowing there was already an implementation of this concept

- https://github.com/minht11/solid-virtual-container

## Bugs That Have Been Fixed

The end of the list, seems to be a problematic edge case for the implementation of this concept.

- scrolling to the bottom doesn't render the last few items
- when at the bottom of the list and then maximising to a bigger size, doesn't render previous items

## Author

- https://github.com/titoBouzout

## URL

- https://github.com/titoBouzout/solid-windowed
- Playground. Look at solid handling 1.5 million of items and being able to render and scroll them super fast: https://playground.solidjs.com/?hash=430573707&version=1.4.1
