<script lang="ts">
  import Icon from 'svelte-icons-pack/Icon.svelte';
  import BiChevronLeft from 'svelte-icons-pack/bi/BiChevronLeft';
  import BiCheck from 'svelte-icons-pack/bi/BiCheck';
  import FiBluetooth from 'svelte-icons-pack/fi/FiBluetooth';
  import CgBattery from 'svelte-icons-pack/cg/CgBattery';
  import {
    Button,
    GradientButton,
    DarkMode
  } from 'flowbite-svelte';
  import { onMount } from 'svelte';
  import { adding_battery } from '../../../add/store';
  import { selected_address } from '../../../store';
  import { update } from '../../../store';

  let battery_list: any[] = [{ name: '예시', charge: 100 }];

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
      battery_list.push(JSON.parse(localStorage.getItem(String(i)) || '{}'));
    }
  }

  // (function () {
  // 	battery_list = [];
  // 	for (let i = 0; i < localStorage.length - 4; i++) {
  // 		battery_list.push(JSON.parse(localStorage.getItem(String(i)) || '{}'))
  // 	}
  // })();

  $: changedLevel = Number(final_value);

  let english : Boolean;

  let selected_battery = battery_list[$selected_address];

  let reset_adding_battery = () => {
    $adding_battery = { name: '', charge: 0 };
    connected = false;
    complete = false;
    final_value = '';
  };

  let dark = false;
  let editing = false;
  let popupmodal = false;

  let connected = false;
  let complete = false;
  let final_value = '';

  let device: BluetoothDevice | null = null;
  let server: BluetoothRemoteGATTServer | null = null;
  let characteristics = new Map();

  const YOUR_SERVICE_UUID = 'af294c50-a8dd-81f1-dac1-f0f240b37428';
  const YOUR_CHARACTERISTIC_UUID = '4401fdb2-96c7-45af-bf2d-48ae588088ed';

  async function connectToDevice() {
    try {
      device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [YOUR_SERVICE_UUID] }],
        // acceptAllDevices: true,
      });

      if (device && device.gatt) {
        connected = true;
        device.addEventListener('gattserverdisconnected', onDisconnected)
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

  function onDisconnected() {
    console.log('> Bluetooth Device disconnected')
    connect();
  }

  function connect() {
    exponentialBackoff(3, 2,
    function toTry() {
      time('Connecting to Bluetooth Device... ');
      return device?.gatt?.connect()
    },
    function success() {
      console.log('> Bluetooth Device connected. Try disconnect it now.');
    },
    function fail() {
      time('Failed to reconnect');
    }
    )
  }
  function exponentialBackoff(max: number, delay: number, toTry: any, success: { (): void; (arg0: any): any; }, fail: { (): void; (): any; }) {
    toTry().then((result: any) => success(result))
    .catch((_: any) => {
      if (max === 0) {
        return fail();
      }
      time('Retrying in ' + delay + 's... (' + max + ' tries left)');
      setTimeout(() => {
        exponentialBackoff(--max, delay * 2, toTry, success, fail);
      }, delay * 1000);
    })
  }

  function time(text: string) {
    console.log('[' + new Date().toJSON().substr(11, 8) + ']' + text)
  }

  async function cacheCharacteristics() {
    // console.log('캐치 어쩌고');
    if (server) {
      const service = await server.getPrimaryService(YOUR_SERVICE_UUID);
      const characteristic = await service.getCharacteristic(
        YOUR_CHARACTERISTIC_UUID
      );
      // characteristic.addEventListener('characteristicvaluechanged', handleBatteryLevelChanged)
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

  async function updateCharacteristicValue() {
    const characteristic = characteristics.get(YOUR_CHARACTERISTIC_UUID);
    if (characteristic) {
      const value = await characteristic.readValue();
      const typedArray = new Int8Array(value.buffer);
      let array = [...typedArray];
      array.splice(array.indexOf(46));
      for (let i = 0; i < array.length; i++) {
        final_value += String.fromCharCode(array[i]);
      }
    } else {
      console.error('Characteristic is undefined.');
    }
  }

  function updateLevel() {
    setInterval(() => {
      resetBatteryList();
      cacheCharacteristics();
      updateCharacteristicValue().then(() => {
        battery_list[$selected_address].charge = Number(final_value);
        final_value = '';
        resetLocalStorage();
      })
    }, 10)
  }

  onMount(() => {
    english = Boolean(localStorage.getItem('english'))
    resetBatteryList();
  })
</script>

<DarkMode />

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
<div>
  <GradientButton
    on:click={connectToDevice}
    color="cyanToBlue"
    style="margin-top: 250px; margin-left: 118.575px;"
    ><Icon src={FiBluetooth} size="24" />{english
      ? 'Connect bluetooth'
      : '블루투스 연결'}</GradientButton
  >
</div>
<div>
  {#if connected}
    <GradientButton
      on:click={readCharacteristicValue}
      color="cyanToBlue"
      style="margin-top: 50px; margin-left: 118.575px;"
      ><Icon src={CgBattery} color="#FFF" size="24" />{english
        ? 'Get battery level'
        : '충전량 구하기'}</GradientButton
    >
  {:else if complete}
  <GradientButton
      color="cyanToBlue"
      style="margin-top: 50px; margin-left: 118.575px;"
      disabled
      ><Icon src={CgBattery} color="#FFF" size="24" />{english
        ? 'Get battery level'
        : '충전량 구하기'}</GradientButton
    >
  {:else}
    <GradientButton
      color="cyanToBlue"
      style="margin-top: 50px; margin-left: 118.575px;"
      disabled
      ><Icon src={CgBattery} color="#FFF" size="24" />{english
        ? 'Get battery level'
        : '충전량 구하기'}</GradientButton
    >
  {/if}
</div>
{#if english}
  {#if complete}
  <a href="/device">
    <Button
      on:click={() => {
        $adding_battery.charge = Number(final_value);
        battery_list.push($adding_battery);
        reset_adding_battery();
        resetLocalStorage();
        updateLevel();
        $update = 1;
        alert('Added successfully');
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
{:else if complete}
<a href="/device">
  <Button
    on:click={() => {
      $adding_battery.charge = Number(final_value);
      battery_list.push($adding_battery);
      reset_adding_battery();
      resetLocalStorage();
      updateLevel();
      $update = 1;
      alert('성공적으로 추가되었습니다.');
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
  }  :global(.next_button) {
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