<script lang="ts">
  import "../app.postcss";
  import Icon from "svelte-icons-pack/Icon.svelte";
  import AiFillHome from "svelte-icons-pack/ai/AiFillHome";
  import AiOutlineHome from "svelte-icons-pack/ai/AiOutlineHome";
  import BsGrid from "svelte-icons-pack/bs/BsGrid";
  import IoGrid from "svelte-icons-pack/io/IoGrid";
  import AiOutlineSetting from "svelte-icons-pack/ai/AiOutlineSetting";
  import AiFillSetting from "svelte-icons-pack/ai/AiFillSetting";
  import { onMount } from 'svelte';


  let battery_list: any[] = [{ name: "예시", charge: 100 }];

  let selected_screen : string;

  if (typeof window !== "undefined") {
    if (window.location.href === 'http://localhost:5173/') {
      selected_screen = 'home';
    } else if (window.location.href === 'http://localhost:5173/device') {
      selected_screen = 'device';
    } else if (window.location.href === 'http://localhost:5173/setting' || window.location.href === "http://localhost:5173/setting/language" || window.location.href === "http://localhost:5173/setting/theme"){
      selected_screen = 'setting';
    }
  }

  function resetLocalStorage() {
    let len = localStorage.length - 3;
    for (let i = 0; i < len; i++) {
      localStorage.removeItem(String(i));
    }
    battery_list.forEach((e) => {
      localStorage.setItem(
        String(battery_list.indexOf(e)),
        JSON.stringify(battery_list[battery_list.indexOf(e)])
      );
    });
  }

  function resetBatteryList() {
    battery_list = [];
    for (let i = 0; i < localStorage.length - 3; i++) {
      battery_list.push(JSON.parse(localStorage.getItem(String(i)) || "{}"));
    }
  }

  // (function () {
  // 	battery_list = [];
  // 	for (let i = 0; i < localStorage.length - 4; i++) {
  // 		battery_list.push(JSON.parse(localStorage.getItem(String(i)) || '{}'))
  // 	}
  // })();

  let battery_count = `배터리 ${battery_list.length + 1}`;

  let english : Boolean;

  let adding_battery = { name: "", charge: 0 };

  let selected_battery = battery_list[0];

  let reset_adding_battery = () => {
    adding_battery = { name: "", charge: 0 };
    battery_count = `배터리 ${battery_list.length + 1}`;
    connected = false;
    complete = false;
    final_value = "";
  };

  let connected = false;
  let complete = false;
  let final_value = "";

  let device: BluetoothDevice | null = null;
  let server: BluetoothRemoteGATTServer | null = null;
  let characteristics = new Map();

  const YOUR_SERVICE_UUID = "af294c50-a8dd-81f1-dac1-f0f240b37428";
  const YOUR_CHARACTERISTIC_UUID = "af294c50-a8dd-81f1-dac1-f0f240b37428";

  async function connectToDevice() {
    try {
      device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [YOUR_SERVICE_UUID] }],
        // acceptAllDevices: true,
      });

      if (device && device.gatt) {
        connected = true;
        server = await device.gatt.connect();
        console.log("Connected to the device:", device.name);

        await cacheCharacteristics();
      } else {
        console.error("Device or gatt object is undefined.");
      }
    } catch (error) {
      console.error("Error connecting to the device:", error);
    }
  }

  async function cacheCharacteristics() {
    if (server) {
      const service = await server.getPrimaryService(YOUR_SERVICE_UUID);
      const characteristic = await service.getCharacteristic(
        YOUR_CHARACTERISTIC_UUID
      );
      characteristics.set(YOUR_CHARACTERISTIC_UUID, characteristic);
    }
  }

  async function readCharacteristicValue() {
    const characteristic = characteristics.get(YOUR_CHARACTERISTIC_UUID);
    if (characteristic) {
      const value = await characteristic.readValue();
      const typedArray = new Int8Array(value.buffer);
      let array = [...typedArray];
      array.splice(array.indexOf(46));
      for (let i = 0; i < array.length; i++) {
        final_value += String.fromCharCode(array[i]);
      }
      complete = true;
    } else {
      console.error("Characteristic is undefined.");
    }
  }

  function updateLevel() {
    console.log(battery_list[battery_list.indexOf(selected_battery)].charge);
    for (let i = 0; i < 100; i++) {
      battery_list[battery_list.indexOf(selected_battery)].charge = i;
      resetLocalStorage;
    }
  }

  onMount(() => [
    english = Boolean(localStorage.getItem('english'))
  ])
</script>

<div class="bar" style="top: 743px;">
  <a href="/">
    <button class="tab_button" on:click={() => selected_screen = 'home'}>
      {#if selected_screen === 'home'}
      <Icon src={AiFillHome} className="icon down" size="50" />
      {#if english}
            <h1
              class="selected_text"
              style="margin: 15px; top: -7px; left: -18px;"
            >
              Home
            </h1>
          {:else}
            <h1 class="selected_text" style="margin: 15px; top: -7px;">홈</h1>
          {/if}
      {:else}
      <Icon src={AiOutlineHome} className="icon down" size="50" />
      {#if english}
            <h1
              class="unselected_text"
              style="margin: 15px; top: -7px; left: -18px;"
            >
              Home
            </h1>
          {:else}
            <h1 class="unselected_text" style="margin: 15px; top: -7px;">홈</h1>
          {/if}
      {/if}
    </button>
  </a>
  <a href="/device">
    <button class="tab_button" on:click={() => selected_screen = 'device'}>
      {#if selected_screen === 'device'}
      <Icon src={IoGrid} className="unicon up" size="50" />
      {#if english}
            <h1
              class="selected_text"
              style="margin: 0px -14px; top: -6px; left:6px;"
            >
              Device
            </h1>
          {:else}
            <h1 class="selected_text" style="margin: 0px -14px; top: -6px;">
              디바이스
            </h1>
          {/if}
      {:else}
      <Icon src={BsGrid} className="unicon up" size="50" />
      {#if english}
            <h1
              class="unselected_text"
              style="margin: 0px -14px; top: -6px; left: 3px;"
            >
              Device
            </h1>
          {:else}
            <h1 class="unselected_text" style="margin: 0px -14px; top: -6px;">
              디바이스
            </h1>
          {/if}
      {/if}
    </button>
  </a>
  <a href="/setting">
    <button class="tab_button" on:click={() => selected_screen = 'setting'}>
      {#if selected_screen === 'setting'}
      <Icon src={AiFillSetting} className="icon up" size="50" />
      {#if english}
            <h1
              class="selected_text"
              style="margin: 0px 4px; top: -6px; left: -16px;"
            >
              Settings
            </h1>
          {:else}
            <h1 class="selected_text" style="margin: 0px 4px; top: -6px;">
              설정
            </h1>
          {/if}
      {:else}
      <Icon src={AiOutlineSetting} className="icon up" size="50" />
      {#if english}
            <h1
              class="unselected_text"
              style="margin: 0px 4px; top: -6px; left: -16px;"
            >
              Settings
            </h1>
          {:else}
            <h1 class="unselected_text" style="margin: 0px 4px; top: -6px;">
              설정
            </h1>
          {/if}
      {/if}
    </button>
  </a>
</div>

<slot />

<style>
  * {
    position: relative;
  }
  .bar {
    width: 390px;
    height: 101px;
    border-radius: 15px 15px 0px 0px;
    background: #818181;
    z-index: 5;
  }
  .tab_button {
    width: 43px;
    height: 72px;
    border-color: rgba(0, 0, 0, 0);
    background: rgba(255, 0, 0, 0);
    margin: 8px 40px;
    cursor: pointer;
  }
  .selected_text {
    color: #fff;
    text-align: left;
    font-size: 20px;
    font-weight: 700;
    white-space: nowrap;
  }
  .unselected_text {
    color: #fff;
    text-align: center;
    font-size: 20px;
    font-weight: 400;
    white-space: nowrap;
  }
</style>
