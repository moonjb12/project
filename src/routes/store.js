import { writable } from 'svelte/store';

export const selected_address = writable(0);

selected_address.subscribe((value) => {
  console.log(`selected_address changed! value : ${value}`);
});
