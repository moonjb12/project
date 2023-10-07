<script lang="ts">
  import Icon from 'svelte-icons-pack/Icon.svelte';
  import FiMoreVertical from 'svelte-icons-pack/fi/FiMoreVertical';
  import FiPlus from 'svelte-icons-pack/fi/FiPlus';
  import BiSolidMinusCircle from 'svelte-icons-pack/bi/BiSolidMinusCircle';
  import RiSystemErrorWarningLine from 'svelte-icons-pack/ri/RiSystemErrorWarningLine';
  import {
    Button,
    Dropdown,
    DropdownItem,
    Modal,
  } from 'flowbite-svelte';

  import { DarkMode } from 'flowbite-svelte';

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

<DarkMode />

<div class="frame">
  <div>
    <Modal bind:open={popupmodal} size="xs" autoclose>
      <div class="text-center">
        <Icon
          src={RiSystemErrorWarningLine}
          color="#9CA3AF"
          size="60"
          className="warn"
        />
        <h3
          class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400"
        >
          {english
            ? 'Are you sure you want to delete this battery?'
            : '이 배터리를 삭제하시겠습니까?'}
        </h3>
        <Button
          on:click={() => {
            battery_list.splice(
              battery_list.indexOf(selected_battery),
              1
            );
            // resetLocalStorage();
          }}
          color="blue"
          class="mr-2">{english ? "Yes, I'm sure" : '확인'}</Button
        >
        <Button
          on:click={() => console.log(popupmodal)}
          color="blue"
          outline>{english ? 'No, cancel' : '취소'}</Button
        >
      </div>
    </Modal>
    <h1 class="title" style="margin-left: 40px; margin-top: 50px;">
      {english ? 'Device' : '디바이스'}
    </h1>
    <a href="/device/add">
    <button>
      <Icon src={FiPlus} size="30" className="icon2 plus" />
    </button>
    </a>
    <Icon src={FiMoreVertical} size="30" className="icon2 more menu" />
    <Dropdown>
      <DropdownItem on:click={() => (editing = !editing)} class="menuitem"
        >{english ? 'Edit' : '편집'}</DropdownItem
      >
    </Dropdown>
  </div>
  <div class="scroll">
  {#each battery_list as b}
    <div class="battery_box">
      <h1
        class="battery_name"
        style="text-align: left; margin-left: 20px; top: 10px;"
      >
        {b.name}
      </h1>
      {#if !editing}
        <Icon
          src={FiMoreVertical}
          size="20"
          className="battery_more menu"
        />
        <Dropdown>
          <a href="/device/rename">
          <DropdownItem
            class="menuitem"
            >{english ? 'Rename' : '이름 변경'}</DropdownItem
          >
        </a>
        <a href="/device/reconnect">
          <DropdownItem
            class="menuitem"
            >{english ? 'Reconnect' : '재연결'}</DropdownItem
          >
        </a>
          <DropdownItem
            on:click={() => {
              popupmodal = true;
              selected_battery = b;
            }}
            class="menuitem"
            style="color: red;"
            >{english ? 'Delete' : '삭제'}</DropdownItem
          >
        </Dropdown>
      {:else}
        <button
          on:click={() => (popupmodal = true)}
          style="width: 20px; height: 22px;	left: 200px;"
        >
          <Icon
            src={BiSolidMinusCircle}
            size="22"
            color="red"
            className="del_button"
          />
        </button>
      {/if}
      <h1 class="battery_text">
        {english ? `level : ${b.charge}%` : `충전 상태 : ${b.charge}%`}
      </h1>
    </div>
  {/each}
  </div>
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
  :global(html.dark) .battery_box {
    background: #1a2534;
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
  .battery_name {
    color: #000;
    font-size: 20px;
    font-weight: 500;
    text-align: center;
  }
  .title {
    color: #000;
    text-align: left;
    font-size: 40px;
    font-weight: 500;
    white-space: nowrap;
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
  :global(.battery_selector) {
    margin-left: 130px;
    margin-top: -46px;
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
    margin-left: 170px;
    margin-bottom: 10px;
  }
</style>