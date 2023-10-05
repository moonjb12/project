<script lang="ts">
  import Icon from 'svelte-icons-pack/Icon.svelte';
  import BiChevronLeft from 'svelte-icons-pack/bi/BiChevronLeft';
  import CgArrowRight from 'svelte-icons-pack/cg/CgArrowRight';
  import {
    Button,
  } from 'flowbite-svelte';

  let main_data = [
    { pos: 0, screen: 'home' },
    { pos: 1, screen: 'device' },
    { pos: 2, screen: 'setting' },
    { pos: 3, screen: 'name' },
    { pos: 4, screen: 'add' },
    { pos: 5, screen: 'reconnect' },
    { pos: 6, screen: 'rename' },
  ];
  let position = 0;

  let battery_list: any[] = [{ name: '예시', charge: 100 }];

  function resetLocalStorage() {
    let len = localStorage.length - 4;
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
    for (let i = 0; i < localStorage.length - 4; i++) {
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
  let editingPos = 0;

  let adding_battery = { name: '', charge: 0 };

  let selected_screen = main_data[0]['screen'];
  let selected_battery = battery_list[0];

  let prev_position = 0;

  let reset_adding_battery = () => {
    adding_battery = { name: '', charge: 0 };
    battery_count = `배터리 ${battery_list.length + 1}`;
    connected = false;
    complete = false;
    final_value = '';
  };

  let dark = false;
  let editing = false;
  let popupmodal = false;
  let english = false;

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
</script>

<div class="frame">
  <a href="/device">
<button
          style="margin-left: 0px;"
        >
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
        <input class="name_input" bind:value={battery_count} />
        {#if battery_count !== ''}
        <a href="/add/connect">
          <Button
            on:click={() => {
              adding_battery.name = battery_count;
            }}
            color="blue"
            class="next_button"><Icon src={CgArrowRight} size="40" /></Button
          >
        </a>
        {:else}
          <Button color="blue" class="next_button" disabled
            ><Icon src={CgArrowRight} size="40" /></Button
          >
        {/if}
      </div>

<!-- ----------------------------------------------------------------------스타일------------------------------------------------------------------------------------ -->

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
  :global(html.dark) .bar {
    background: #1a2534;
  }
  :global(html.dark) .in-condition {
    background: #1f2937;
  }
  :global(html.dark) .cutton {
    background: #1f2937;
  }
  :global(html.dark .battery_more) {
    color: #fff;
  }
  :global(html.dark .del_button) {
    background: #1f2937;
  }
  :global(html.dark) .selector {
    background: #1f2937;
    border: 1px solid #fff;
  }
  :global(html.dark .icon, .title_back) {
    color: #fff;
  }
  :global(html.dark .icon2) {
    color: #fff;
  }
  :global(html.dark) .battery_box {
    background: #1a2534;
  }
  :global(html.dark) .setting_box {
    background: #1a2534;
    border-top: 1px solid #374861;
    border-bottom: 1px solid #374861;
  }
  :global(html.dark) .setting_title_box {
    background: #1a2534;
    border-bottom: 1px solid #374861;
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
  .selector {
    width: 170px;
    height: 52px;
    background-color: #fff;
    border: 1px solid #000;
    position: relative;
    left: 110px;
    top: 56px;
    box-shadow: 3px, 3px, 6px, 0px, rgba(0, 0, 0, 0.3);
    border-radius: 100px;
  }
  .battery_name {
    color: #000;
    font-size: 20px;
    font-weight: 500;
    text-align: center;
  }
  .condition {
    width: 290px;
    height: 290px;
    border-radius: 290px;
    box-shadow: 10px 10px 15px 0px rgba(0, 0, 0, 0.3);
    margin-left: 50px;
    margin-top: 100px;
  }
  .in-condition {
    width: 240px;
    height: 240px;
    border-radius: 240px;
    background: #fff;
    box-shadow: 5px 5px 10px 5px rgba(0, 0, 0, 0.15) inset;
    left: 25px;
    top: 25px;
  }
  .condition-number {
    color: #000;
    text-align: center;
    font-size: 70px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    left: 10px;
    top: 73px;
  }

  /*추가*/

  .add {
    width: 96px;
    height: 96px;
    border-radius: 96px;
    box-shadow: 10px 10px 15px 0px rgba(0, 0, 0, 0.3);
    margin-left: 150px;
    margin-top: 70px;
  }
  .push_message {
    color: #a1a1a1;
    text-align: center;
    font-size: 20px;
    font-weight: 500;
    white-space: nowrap;
    margin-left: -50px;
    margin-top: 50px;
  }

  /*메뉴*/

  .bar {
    width: 390px;
    height: 101px;
    border-radius: 15px 15px 0px 0px;
    background: #818181;
    z-index: 1;
  }
  .selected_text {
    color: #fff;
    text-align: left;
    font-size: 20px;
    font-weight: 700;
    white-space: nowrap;
  }

  .tab_button {
    width: 43px;
    height: 72px;
    border-color: rgba(0, 0, 0, 0);
    background: rgba(0, 0, 0, 0);
    margin: 8px 40px;
    cursor: pointer;
  }
  .unselected_text {
    color: #fff;
    text-align: center;
    font-size: 20px;
    font-weight: 400;
    white-space: nowrap;
  }

  .title {
    color: #000;
    text-align: left;
    font-size: 40px;
    font-weight: 500;
    white-space: nowrap;
  }
  .cutton {
    width: 1000px;
    height: 900px;
    background: #fff;
    z-index: 10;
    position: absolute;
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
  .battery_box {
    width: 220px;
    height: 104px;
    border-radius: 15px;
    background: #fff;
    box-shadow: 4px 4px 5px 0px rgba(0, 0, 0, 0.25);
    margin-left: 80px;
    margin-top: 40px;
    margin-bottom: 30px;
  }
  .battery_text {
    color: #5d5d5d;
    text-align: left;
    font-size: 15px;
    font-weight: 400;
    white-space: nowrap;
    margin-left: 20px;
    margin-top: -20px;
  }
  :global(.plus_stick) {
    margin-left: 14px;
    position: relative;
    top: 14px;
  }
  .setting_box {
    width: 390px;
    height: 54px;
    border-top: 1px solid #d1d1d1;
    border-bottom: 1px solid #d1d1d1;
    background: #fff;
  }
  .setting_title {
    width: 100px;
    height: 20px;
    color: #818181;
    font-size: 15px;
    font-weight: 500;
    margin-left: 20px;
    margin-top: 16px;
    white-space: nowrap;
  }
  .setting_sample {
    width: 100px;
    height: 40px;
    color: #818181;
    text-align: right;
    font-size: 15px;
    font-weight: 500;
    white-space: nowrap;
    margin-left: 256px;
    margin-top: -20px;
  }
  :global(.setting_next) {
    margin-left: 360px;
    position: relative;
    top: -40px;
  }
  .setting_title_box {
    width: 390px;
    height: 74px;
    border-bottom: 1px solid #dfdfdf;
    background: #fff;
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
  .setting_title_text {
    color: #000;
    text-align: center;
    font-size: 20px;
    font-weight: 500;
    margin-top: -10px;
  }
  .scroll {
    height: 610px;
    margin-top: 30px;
    overflow: auto;
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
  .setting_text {
    font-size: 15px;
    font-weight: 500;
    color: #818181;
    margin-left: 36px;
    margin-top: 16px;
    margin-bottom: -20px;
  }
  .darkmode_button {
    border: 1px solid #000;
    width: 30px;
    margin-left: 390px;
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