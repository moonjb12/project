import { writable } from 'svelte/store';

export const editing = writable(0);

editing.subscribe((value) => {
  console.log(`editing changed! value : ${value}`);
});
