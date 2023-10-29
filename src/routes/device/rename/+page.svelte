<script lang="ts">
  import Icon from 'svelte-icons-pack/Icon.svelte';
  import BiChevronLeft from 'svelte-icons-pack/bi/BiChevronLeft';
  import BiCheck from 'svelte-icons-pack/bi/BiCheck';
  import {
    Button,
  } from 'flowbite-svelte';
  import { onMount } from 'svelte';
  import { editingPos } from '../store';

  let setting_data = [
    { pos: 0, screen: 'main' },
    { pos: 1, screen: 'lang' },
    { pos: 2, screen: 'theme' },
  ];
  let setting_position = 0;
  let setting_slideWidth;

  let battery_list: any[] = [{ name: '예시', charge: 100 }];

  function resetLocalStorage() {
    let len = localStorage.length - 6;
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
    for (let i = 0; i < localStorage.length - 6; i++) {
      battery_list.push(JSON.parse(localStorage.getItem(String(i)) || '{}'));
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

  let selected_battery = battery_list[0];

  let prev_position = 0;

  let connected = false;
  let complete = false;
  let final_value = '';

  let device: BluetoothDevice | null = null;
  let server: BluetoothRemoteGATTServer | null = null;
  let characteristics = new Map();

  const YOUR_SERVICE_UUID = 'af294c50-a8dd-81f1-dac1-f0f240b37428';
  const YOUR_CHARACTERISTIC_UUID = 'af294c50-a8dd-81f1-dac1-f0f240b37428';

  async function connectToDevice() {
    try {
      device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [YOUR_SERVICE_UUID] }],
        // acceptAllDevices: true,
      });

      if (device && device.gatt) {
        connected = true;
        server = await device.gatt.connect();
        console.log('Connected to the device:', device.name);

        await cacheCharacteristics();
      } else {
        console.error('Device or gatt object is undefined.');
      }
    } catch (error) {
      console.error('Error connecting to the device:', error);
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
      console.error('Characteristic is undefined.');
    }
  }

  function updateLevel() {
    console.log(battery_list[battery_list.indexOf(selected_battery)].charge);
    for (let i = 0; i < 100; i++) {
      battery_list[battery_list.indexOf(selected_battery)].charge = i;
      resetLocalStorage;
    }
  }

  onMount(() => {
    english = Boolean(localStorage.getItem('english'))
    resetBatteryList();
  })
</script>

<div class="frame">
  <a href="./">
<button style="margin-left: 0px;">
          <Icon
            src={BiChevronLeft}
            size="30"
            color="#818181"
            className="title_back"
          />
          <h1 class="title_back_text">{english ? 'back' : '돌아가기'}</h1>
        </button>
      </a>
        <h1 class="question">
          {english ? 'Input battery name' : '이름을 입력해 주세요'}
        </h1>
        <input class="name_input" bind:value={battery_list[$editingPos].name} />
        {#if english}
            {#if battery_list[$editingPos].name !== ''}
            <a href="./">
            <Button
              on:click={() => {
                resetLocalStorage();
                alert('Changed successfully');
              }}
              class="complete_button"
              color="blue"
              style="margin-left: 132px;"
              >Complete<Icon src={BiCheck} size="25" className="icon" /></Button
            >
          </a>
            {:else}
            <Button
              class="complete_button"
              color="blue"
              style="margin-left: 132px;"
              disabled
              >Complete<Icon src={BiCheck} size="25" className="icon" /></Button
            >
          {/if}
          {:else if battery_list[$editingPos].name !== ''}
          <a href="./">
          <Button
            on:click={() => {
              resetLocalStorage();
              alert('성공적으로 변경되었습니다.');
            }}
            class="complete_button"
            color="blue"
            >완료<Icon src={BiCheck} size="25" className="icon" /></Button
          >
          </a>
          {:else}
          <Button class="complete_button" color="blue" disabled
            >완료<Icon src={BiCheck} size="25" className="icon" /></Button
          >
          {/if}
</div>

<style>
  * {
    position: relative;
  }
  :global(html.dark) h1 {
    color: #fff;
  }
  :global(html.dark) .frame {
    background-image: linear-gradient(135deg, #374861 0%, #1f2937 100%);
  }
  :global(html.dark .battery_more) {
    color: #fff;
  }
  :global(html.dark .del_button) {
    background: #1f2937;
  }
  :global(html.dark .icon, .title_back) {
    color: #fff;
  }
  :global(html.dark .icon2) {
    color: #fff;
  }
  :global(html.dark) .title_back_text {
    color: #818181;
  }
  :global(html.dark .unicon) {
    filter: invert(100%);
  }
  .frame {
    width: 390px;
    height: 844px;
    background-image: linear-gradient(135deg, #fff 0%, #ebebeb 100%);
    background: linear-gradient();
    position: absolute;
    left: 0px;
    top: 0px;
  }
  :global(.more) {
    position: relative;
    margin-left: 350px;
    margin-top: -65px;
  }
  :global(.battery_more) {
    position: relative;
    margin-left: 190px;
    margin-top: -16px;
    margin-bottom: 25px;
  }
  :global(.plus) {
    position: relative;
    margin-left: 310px;
    margin-top: -60px;
  }
  :global(.icon) {
    filter: invert(100%);
  }
  :global(.down) {
    position: relative;
    top: 8px;
  }
  :global(.up) {
    position: relative;
    top: -6px;
  }
  :global(.plus_stick) {
    margin-left: 14px;
    position: relative;
    top: 14px;
  }
  :global(.setting_next) {
    margin-left: 360px;
    position: relative;
    top: -40px;
  }
  :global(.title_back) {
    margin-left: 10px;
    margin-bottom: 0px;
    margin-top: 16px;
  }
  .title_back_text {
    color: #a2a2a2;
    text-align: left;
    font-size: 15px;
    font-weight: 600;
    margin-left: 30px;
    margin-top: -29px;
  }
  :global(.unicon) {
    filter: invert(100%);
  }
  :global(.icon2) {
    color: #000;
  }
  :global(.menu) {
    cursor: pointer;
  }
  :global(.menuitem) {
    white-space: nowrap;
  }
  :global(.darkmode) {
    margin-top: -100px;
    margin-left: -110px;
  }
  :global(.battery_selector) {
    margin-left: 130px;
    margin-top: -46px;
  }
  .question {
    font-weight: 500;
    font-size: 120%;
    margin-top: 240px;
    text-align: center;
  }
  .name_input {
    width: 300px;
    height: 40px;
    box-shadow: 5px 5px 5px 0px rgba(0, 0, 0, 0.3);
    text-align: center;
    margin-left: 45px;
    margin-top: 30px;
  }
  :global(.next_button) {
    height: 70px;
    margin-left: 155.015px;
    margin-top: 160px;
  }
  :global(.complete_button) {
    margin-left: 148.525px;
    margin-top: 140px;
  }
  :global(.del_button) {
    background: #fff;
    margin-left: -12px;
    margin-top: -35px;
  }
  :global(.warn) {
    margin-left: 125px;
    margin-bottom: 10px;
  }
</style>