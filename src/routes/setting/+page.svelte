<script lang="ts">
  import Icon from 'svelte-icons-pack/Icon.svelte';
  import BiChevronRight from 'svelte-icons-pack/bi/BiChevronRight';
  import { DarkMode } from 'flowbite-svelte';
  import { onMount } from 'svelte';

  let main_data = [
    { pos: 0, screen: 'home' },
    { pos: 1, screen: 'device' },
    { pos: 2, screen: 'setting' },
    { pos: 3, screen: 'name' },
    { pos: 4, screen: 'add' },
    { pos: 5, screen: 'reconnect' },
    { pos: 6, screen: 'rename' },
  ];

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

  let adding_battery = { name: '', charge: 0 };

  let selected_battery = battery_list[0];

  let reset_adding_battery = () => {
    adding_battery = { name: '', charge: 0 };
    battery_count = `배터리 ${battery_list.length + 1}`;
    connected = false;
    complete = false;
    final_value = '';
  };

  let dark : boolean;

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
    if (localStorage.getItem('color-theme') === 'light') {
      dark = false;
    } else {
      dark = true;
    }
    english = Boolean(localStorage.getItem('english'))
  })
</script>

<DarkMode />

<div class="frame">
              <h1 class="title" style="margin-left: 40px; margin-top: 50px;">
                {english ? 'Settings' : '설정'}
              </h1>
              <div>
                <a href="/setting/theme">
                <button>
                  <div class="setting_box" style="margin-top: 60px;">
                    <h1 class="setting_title">{english ? 'Theme' : '테마'}</h1>
                    <h1 class="setting_sample" style="margin-top: -20px;">
                      {english
                        ? `${dark ? 'Dark mode' : 'Light mode'}`
                        : `${dark ? '어두운 화면' : '밝은 화면'}`}
                    </h1>
                    <Icon
                      src={BiChevronRight}
                      size="50"
                      className="setting_next"
                      color="#818181"
                    />
                  </div>
                </button>
                </a>
                <a href="/setting/language">
                <button>
                  <div class="setting_box">
                    <h1 class="setting_title">
                      {english ? 'Language' : '언어'}
                    </h1>
                    <h1 class="setting_sample" style="">
                      {english ? 'English' : '한국어'}
                    </h1>
                    <Icon
                      src={BiChevronRight}
                      size="50"
                      className="setting_next"
                      color="#818181"
                    />
                  </div>
                </button>
              </a>
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
            :global(html.dark) .setting_box {
              background: #1a2534;
              border-top: 1px solid #374861;
              border-bottom: 1px solid #374861;
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