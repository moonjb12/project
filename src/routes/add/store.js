import { writable } from 'svelte/store';

export const adding_battery = writable({ name: '', charge: 0 });

adding_battery.subscribe((value) => {
  console.log(`adding_battery changed! value : ${JSON.stringify(value)}`);
});
