import { writable } from 'svelte/store';

export const selected_address = writable(0);

export const update = writable(0);

selected_address.subscribe((value) => {
  console.log(`selected_address changed! value : ${value}`);
});

update.subscribe((value) => {
  console.log(`update changed! value : ${value}`);
});
