<script lang="ts">
  import Icon from 'svelte-icons-pack/Icon.svelte';

  import { DarkMode } from 'flowbite-svelte';

  import FiPlus from 'svelte-icons-pack/fi/FiPlus';

  import CgChevronDown from 'svelte-icons-pack/cg/CgChevronDown';
  import {
    Button,
    Dropdown,
    DropdownItem,
  } from 'flowbite-svelte';
  import { onMount } from 'svelte';
  import { selected_address } from './store';
  import { update } from './store';

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

  let battery_list: any[] = [];

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

  let battery_count = `배터리 ${battery_list.length + 1}`;

  let english : Boolean;

  let adding_battery = { name: '', charge: 0 };

  $: selected_battery = battery_list[$selected_address];

  let reset_adding_battery = () => {
    adding_battery = { name: '', charge: 0 };
    battery_count = `배터리 ${battery_list.length + 1}`;
    connected = false;
    complete = false;
    final_value = '';
  };

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

      console.log(typeof device);

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
    setInterval(() => {
      resetBatteryList();
    }, 10);
  })
</script>

<!-- ----------------------------------------------------------------------홈------------------------------------------------------------------------------------ -->

<button on:click={resetBatteryList}>resetBatteryList</button>
<button on:click={resetLocalStorage}>resetLocalStorage</button>
<button
  on:click={() => {
    console.log(battery_list);
    console.log(localStorage);
  }}>check</button
>

<DarkMode />

<div class="frame">
        <div class="selector">
          {#if battery_list.length === 0}
            <h1 class="battery_name" style="margin-top: 10px;">{english ? 'Unknown' : '이름 없음'}</h1>
          {:else}
            <h1 class="battery_name" style="margin-top: 10px;">
              {selected_battery.name}<button class="battery_selector_button">
                <Icon
                  src={CgChevronDown}
                  className="icon2 battery_selector menu"
                  size="20"
                />
                <Dropdown>
                  {#each battery_list as b}
                    <DropdownItem
                      class="menuitem"
                      on:click={() => $selected_address = battery_list.indexOf(b)}
                      >{b.name}</DropdownItem
                    >
                  {/each}
                </Dropdown>
              </button>
            </h1>
          {/if}
        </div>
        {#if battery_list.length === 0}
          <div class="condition" style="background: #FFF; height: 290px; width: 290px; margin-left: 50px; margin-top: 100px;">
            <div class="in-condition">
              <h1 class="condition-number">-%</h1>
            </div>
          </div>
        {:else}
        <button on:click={() => {
          connectToDevice().then(() => {
            readCharacteristicValue();
          }).then(() => {
            updateLevel();
          }).then(() => {
            $update = 1;
          })
        }} style="height: 290px; width: 290px; margin-left: 50px; margin-top: 100px;">
          <div
            class="condition"
            style="background: linear-gradient(120deg, hsl({selected_battery.charge}, 100%, 50%) 0%, hsl({selected_battery.charge +
              60}, 100%, 50%) 100%);"
          >
            <div class="in-condition">
              <h1 class="condition-number">{`${selected_battery.charge}%`}</h1>
            </div>
          </div>
        </button>
          {#if $update === 0}
          <h1 class="push_message" style="margin-left : 20px; margin-top : 24px; margin-bottom : -20px; font-size: 18px;">{english ? 'Press the circle to start update level' : '원을 클릭하여 충전량 업데이트 시작'}</h1>
          {/if}
        {/if}
        <a href="/add">
        <button
          on:click={() => {
            reset_adding_battery();
          }}
          style="width: 96px; height: 96px;"
        >
          {#if battery_list.length === 0}
            <div class="add" style="background: #FFF">
              <Icon
                src={FiPlus}
                size="70"
                color="#D1D1D1"
                className="plus_stick"
              />
            </div>
              {#if english}
                <h1 class="push_message" style="margin-left: 60px;">
                  Push the button to add device
                </h1>
              {:else}
                <h1 class="push_message" style="margin-left: 100px;;">버튼을 눌러 기기 추가</h1>
              {/if}
          {:else}
            <div
              class="add"
              style="background: linear-gradient(120deg, hsl({selected_battery.charge +
                60}, 100%, 50%) 0%, hsl({selected_battery.charge}, 100%, 50%) 100%);"
            >
              <Icon
                src={FiPlus}
                size="70"
                color="white"
                className="plus_stick"
              />
              {#if english}
                <h1 class="push_message" style="left: -38px;">
                  Push the button to add device
                </h1>
              {:else}
                <h1 class="push_message">버튼을 눌러 기기 추가</h1>
              {/if}
            </div>
          {/if}
        </button>
      </a>

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

  :global(html.dark) .in-condition {
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
    margin-left: 0px;
    margin-top: 0px;
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
    margin-left: 125px;
    margin-bottom: 10px;
  }
</style>
