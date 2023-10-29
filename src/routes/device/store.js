import { writable } from 'svelte/store';

export const editing = writable(0);

export const editingPos = writable(0);

editing.subscribe((value) => {
  console.log(`editing changed! value : ${value}`);
});

editingPos.subscribe((value) => {
  console.log(`editingPos changed! value : ${value}`);
});
