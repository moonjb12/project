<script lang="ts">
	import Icon from 'svelte-icons-pack/Icon.svelte';
	import FiMoreVertical from "svelte-icons-pack/fi/FiMoreVertical";
	import FiPlus from "svelte-icons-pack/fi/FiPlus";
	import AiFillHome from "svelte-icons-pack/ai/AiFillHome";
	import AiOutlineHome from "svelte-icons-pack/ai/AiOutlineHome";
	import BsGrid from "svelte-icons-pack/bs/BsGrid";
	import IoGrid from "svelte-icons-pack/io/IoGrid";
	import AiOutlineSetting from "svelte-icons-pack/ai/AiOutlineSetting";
	import AiFillSetting from "svelte-icons-pack/ai/AiFillSetting";
	import BiChevronRight from "svelte-icons-pack/bi/BiChevronRight";
	import BiChevronLeft from "svelte-icons-pack/bi/BiChevronLeft";
	import CgChevronDown from "svelte-icons-pack/cg/CgChevronDown";
	import CgArrowRight from "svelte-icons-pack/cg/CgArrowRight";
	import BiCheck from "svelte-icons-pack/bi/BiCheck";
	import BiSolidMinusCircle from "svelte-icons-pack/bi/BiSolidMinusCircle";
  import RiSystemErrorWarningLine from "svelte-icons-pack/ri/RiSystemErrorWarningLine";
	import FiBluetooth from "svelte-icons-pack/fi/FiBluetooth";
	import CgBattery from "svelte-icons-pack/cg/CgBattery";
	import { Button, GradientButton, Dropdown, DropdownItem, Modal } from 'flowbite-svelte';
	import { DarkMode } from 'flowbite-svelte';


	let main_data = [{pos: 0, screen: 'home'}, {pos: 1, screen: 'device'}, {pos: 2, screen: 'setting'}, {pos: 3, screen: 'name'}, {pos: 4, screen: 'add'}];
	let position = 0;
	let duration = 400;
	let slideWidth;

	let setting_data = [{pos: 0, screen: 'main'}, {pos: 1, screen: 'lang'}, {pos: 2, screen: 'theme'}];
	let setting_position = 0;
	let setting_slideWidth;

	let battery_list = [{name: '배터리 1', charge: 100}, {name : '배터리 2', charge: 75}, {name: '배터리ㅣ3', charge: 50}, {name: '4 배터리', charge: 25}, {name: '555 배', charge: 0}, {name: '배6터 리', charge: 63}];

	let battery_count = `배터리 ${battery_list.length + 1}`;
	let charge_count = 0;

	let adding_battery = {name: '', charge: 0};

	let selected_screen = main_data[0]['screen'];
	let selected_battery = battery_list[0];

	let prev_position = 0;

	let reset_adding_battery = () => {
		adding_battery = {name: '', charge: 0};
		battery_count = `배터리 ${battery_list.length + 1}`;
		charge_count = 0;
		connected = false;
		complete = false;
		final_value = '';
	}

	let dark = false  ;
	let editing = false;
	let popupmodal = false;
  let english = false;

	let connected = false;
	let complete = false;
	let final_value = '';

	let device = null;
  let server: BluetoothRemoteGATTServer | null = null;
  let characteristics = new Map();

  // Bluetooth Service and Characteristic UUIDs
  const YOUR_SERVICE_UUID = 'af294c50-a8dd-81f1-dac1-f0f240b37428';
  const YOUR_CHARACTERISTIC_UUID = 'af294c50-a8dd-81f1-dac1-f0f240b37428';

  async function connectToDevice() {
    try {
      device = await navigator.bluetooth.requestDevice({
				filters: [{ services : [YOUR_SERVICE_UUID]}],
        // acceptAllDevices: true,
      });

      if (device && device.gatt) {
				connected = true;
        server = await device.gatt.connect();
        console.log('Connected to the device:', device.name);

        // Cache the characteristics
        await cacheCharacteristics();
        // You can perform additional actions after connecting here
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
      const characteristic = await service.getCharacteristic(YOUR_CHARACTERISTIC_UUID);
      characteristics.set(YOUR_CHARACTERISTIC_UUID, characteristic);
    }
  }

  async function readCharacteristicValue() {
    const characteristic = characteristics.get(YOUR_SERVICE_UUID);
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

</script>

<div class="cutton"style="left: 390px"/>

<div>
	{#each main_data as d}
	{@const modifier = position < d.pos ? 1 : -1}
	<div class="frame"
		bind:clientWidth={slideWidth}
		style:transform="translateX({position === d.pos ? 0 : `${modifier * slideWidth}`}px)"
		style="transition: transform {duration}ms"
	>
	{#if d.pos === 0}
	<!-- ----------------------------------------------------------------------홈------------------------------------------------------------------------------------ -->
		<div class="selector">
			<h1 class="battery_name"style="margin-top: 10px;">{selected_battery.name}<button class="battery_selector_button">
				<Icon src={CgChevronDown} className="icon2 battery_selector menu" size="20"/>
				<Dropdown>
				<!-- <DropdownItem class="menuitem">하하</DropdownItem> -->
			{#each battery_list as b}
				<DropdownItem class="menuitem"on:click={() => selected_battery = b}>{b.name}</DropdownItem>
			{/each}
			</Dropdown>
			</button></h1>
		</div>
		<div class="condition"style="background: linear-gradient(120deg, hsl({selected_battery.charge}, 100%, 50%) 0%, hsl({selected_battery.charge + 60}, 100%, 50%) 100%);">
			<div class="in-condition">
				<h1 class="condition-number">{`${selected_battery.charge}%`}</h1>
			</div>
		</div>
		<button on:click={() => {
			prev_position = 0;
			position = 3;
			reset_adding_battery();
		}} style="width: 96px; height: 96px;">
			<div class="add"style="background: linear-gradient(120deg, hsl({selected_battery.charge + 60}, 100%, 50%) 0%, hsl({selected_battery.charge}, 100%, 50%) 100%);">
				<Icon src={FiPlus} size="70" color=white className="plus_stick"/>
        {#if english}
				<h1 class="push_message" style="left: -38px;">Push the button to add device</h1>
        {:else}
        <h1 class="push_message">버튼을 눌러 기기 추가</h1>
        {/if}
			</div>
		</button>
	{:else if d.pos === 1}
	<!-- ----------------------------------------------------------------------디바이스------------------------------------------------------------------------------------ -->
		<div>
			<Modal bind:open={popupmodal} size="xs" autoclose>
				<div class="text-center">
          <Icon src={RiSystemErrorWarningLine} color="#9CA3AF" size="60" className="warn"/>
					<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">{english ? 'Are you sure you want to delete this battery?' : '이 배터리를 삭제하시겠습니까?'}</h3>
					<Button on:click={() => battery_list.splice(0, 1)} color="blue" class="mr-2">{english ? "Yes, I'm sure" : '확인'}</Button>
					<Button on:click={() => console.log(popupmodal)} color="blue" outline>{english ? 'No, cancel' : '취소'}</Button>
				</div>
			</Modal>
			<h1 class="title"style="margin-left: 40px; margin-top: 50px;">{english ? 'Device' : '디바이스'}</h1>
			<button on:click={() => {
				prev_position = 1;
				position = 3;
			}}>
				<Icon src={FiPlus} size="30" className="icon2 plus" />
			</button>
			<Icon src={FiMoreVertical} size="30" className="icon2 more menu" />
			<Dropdown>
				<DropdownItem on:click={() => editing = !editing} class="menuitem">{english ? 'Edit' : '편집'}</DropdownItem>
			</Dropdown>
		</div>
		<div class="scroll">
		{#each battery_list as b}
			<div class="battery_box">
				<h1 class="battery_name"style="text-align: left; margin-left: 20px; top: 10px;">{b.name}</h1>
				{#if !editing}
				<Icon src={FiMoreVertical} size="20" className="battery_more menu"/>
				<Dropdown>
					<DropdownItem class="menuitem">{english ? 'Rename' : '이름 변경'}</DropdownItem>
					<DropdownItem on:click={() => (popupmodal = true)} class="menuitem"style="color: red;">{english ? 'Delete' : '삭제'}</DropdownItem>
				</Dropdown>
				{:else}
				<button on:click={() => (popupmodal = true)} style="width: 20px; height: 22px;	left: 200px;">
					<Icon src={BiSolidMinusCircle} size="22" color="red" className="del_button"/>
				</button>
				{/if}
				<h1 class="battery_text">{english ? `state : ${b.charge}%` : `충전 상태 : ${b.charge}%`}</h1>
			</div>
		{/each}
		</div>
<!-- ----------------------------------------------------------------------설정------------------------------------------------------------------------------------ -->
	{:else if d.pos === 2}
		{#each setting_data as sd}
		{@const modifier = setting_position < sd.pos ? 1 : -1}
			<div class="frame"
			bind:clientWidth={setting_slideWidth}
			style:transform="translateX({setting_position === sd.pos ? 0 : `${modifier * setting_slideWidth}`}px)"
			style="transition: transform {duration}ms; z-index: 2;"
			>
			{#if sd.pos === 0}
				<h1 class="title"style="margin-left: 40px; margin-top: 50px;">{english ? 'Settings' : '설정'}</h1>
				<div>
					<button on:click={() => setting_position = 1}>
						<div class="setting_box"style="margin-top: 60px;">
							<h1 class="setting_title">{english ? 'Theme' : '테마'}</h1>
							<h1 class="setting_sample"style="margin-top: -20px;">{english ? `${dark ? 'Dark mode' : 'Light mode'}` : `${dark ? '어두운 화면' : '밝은 화면'}`}</h1>
							<Icon src={BiChevronRight} size="50" className="setting_next" color="#818181"/>
						</div>
					</button>
					<button on:click={() => setting_position = 2}>
						<div class="setting_box">
							<h1 class="setting_title">{english ? 'Language' : '언어'}</h1>
							<h1 class="setting_sample"style="">{english ? 'English' : '한국어'}</h1>
							<Icon src={BiChevronRight} size="50" className="setting_next" color="#818181"/>
						</div>
					</button>
				</div>
			{:else if sd.pos === 1}
				<div class="setting_title_box">
					<button on:click={() => setting_position = 0}>
						<Icon src={BiChevronLeft} size="30" color="#818181" className="title_back"/>
						<h1 class="title_back_text">{english ? 'back' : '뒤로'}</h1>
					</button>
					<h1 class="setting_title_text">{english ? 'Theme' : '테마'}</h1>
				</div>
				<div>
					<div class="setting_box" style="margin-top: 60px;">
						<h1 class="setting_text">{english ? 'Push the icon to change theme' : '아이콘을 눌러 테마 변경'}</h1>
						<button class="darkmode_button"on:click={() => {dark = !dark}}>
							<DarkMode class="darkmode"/>
						</button>
					</div>
				</div>
			{:else if sd.pos === 2}
				<div class="setting_title_box">
					<button on:click={() => setting_position = 0}>
						<Icon src={BiChevronLeft} size="30" color="#818181" className="title_back"/>
						<h1 class="title_back_text">{english ? 'back' : '뒤로'}</h1>
					</button>
					<h1 class="setting_title_text">{english ? 'Language' : '언어'}</h1>
				</div>
        <div>
          <button on:click={() => english = false}>
          <div class="setting_box" style="margin-top: 60px;">
            <h1 class="setting_text" style="margin-left: 60px; text-align: left;">한국어</h1>
          </div>
          </button>
          <button on:click={() => english = true}>
          <div class="setting_box">
            <h1 class="setting_text" style="margin-left: 60px; text-align: left;">English</h1>
          </div>
          </button>
        </div>
			{/if}
		</div>
		{/each}

<!-- ------------------------------------------------------------------이름 정하기------------------------------------------------------------------------------- -->

	{:else if d.pos === 3}
	<button on:click={() => position = prev_position} style="margin-left: 0px;">
		<Icon src={BiChevronLeft} size="30" color="#818181" className="title_back"/>
		<h1 class="title_back_text">{english ? 'back' : '돌아가기'}</h1>
	</button>
	<h1 class="question">{english ? 'Input battery name' : '이름을 입력해 주세요'}</h1>
	<input class="name_input"bind:value={battery_count}/>
	{#if battery_count !== ""}
	<Button on:click={() => {
		adding_battery.name = battery_count;
		position += 1;
	}} color="blue" class="next_button" ><Icon src={CgArrowRight} size="40"/></Button>
	{:else}
	<Button color="blue" class="next_button" disabled><Icon src={CgArrowRight} size="40"/></Button>
	{/if}

<!-- ------------------------------------------------------------------충전량 정하기------------------------------------------------------------------------------- -->


	{:else if d.pos === 4}
	<button on:click={() => position -= 1} style="margin-left: 0px;">
		<Icon src={BiChevronLeft} size="30" color="#818181" className="title_back"/>
		<h1 class="title_back_text">{english ? 'back' : '돌아가기'}</h1>
	</button>
	<div>
		<GradientButton on:click={connectToDevice} color="cyanToBlue" style="margin-top: 250px; margin-left: 118.575px;"><Icon src={FiBluetooth} size="24"/>{english ? 'Connect bluetooth' : '블루투스 연결'}</GradientButton>
	</div>
	<div>
		{#if connected}
		<GradientButton on:click={readCharacteristicValue} color="cyanToBlue" style="margin-top: 50px; margin-left: 118.575px;"><Icon src={CgBattery} color="#FFF" size="24"/>{english ? 'Get state' : '충전량 구하기'}</GradientButton>
		{:else}
		<GradientButton color="cyanToBlue" style="margin-top: 50px; margin-left: 118.575px;" disabled><Icon src={CgBattery} color="#FFF" size="24"/>{english ? 'Get state' : '충전량 구하기'}</GradientButton>
		{/if}
	</div>
  {#if english}
	{#if complete}
	<Button on:click={() => {
		adding_battery.charge = Number(final_value);
		battery_list.push(adding_battery);
		reset_adding_battery();
		alert('Added successfully');
		position = prev_position;
	}} class="complete_button" color="blue" style="margin-left: 132px;">Complete<Icon src={BiCheck} size="25" className="icon"/></Button>
	{:else}
	<Button class="complete_button" color="blue" style="margin-left: 132px;" disabled>Complete<Icon src={BiCheck} size="25" className="icon"/></Button>
	{/if}
  {:else}
	{#if complete}
  <Button on:click={() => {
		adding_battery.charge = Number(final_value);
		battery_list.push(adding_battery);
		reset_adding_battery();
		alert('성공적으로 추가되었습니다.');
		position = prev_position;
	}} class="complete_button" color="blue">완료<Icon src={BiCheck} size="25" className="icon"/></Button>
	{:else}
	<Button class="complete_button" color="blue" disabled>완료<Icon src={BiCheck} size="25" className="icon"/></Button>
	{/if}
  {/if}
	{/if}
	</div>
	{/each}
</div>

<!-- ----------------------------------------------------------------------바------------------------------------------------------------------------------------ -->
<div class="bar"style="left: 0px; top: 743px;">
	{#each main_data as d}
	<button class="tab_button" on:click={() => {
		setting_position = 0;
		selected_screen = d.screen;
		return position = d.pos;
	}}>
	{#if selected_screen === 'home'}
		{#if d.pos === 0}
			<Icon src={AiFillHome} className="icon down" size="50"/>
      {#if english}
			<h1 class="selected_text"style="margin: 15px; top: -7px; left: -18px;">Home</h1>
      {:else}
      <h1 class="selected_text"style="margin: 15px; top: -7px;">홈</h1>
      {/if}
		{:else if d.pos === 1}
			<Icon src={BsGrid} className="unicon up" size="50"/>
      {#if english}
			<h1 class="unselected_text"style="margin: 0px -14px; top: -6px; left: 3px;">Device</h1>
      {:else}
      <h1 class="unselected_text"style="margin: 0px -14px; top: -6px;">디바이스</h1>
      {/if}
		{:else if d.pos === 2}
			<Icon src={AiOutlineSetting} className="icon up" size="50"/>
      {#if english}
			<h1 class="unselected_text"style="margin: 0px 4px; top: -6px; left: -14px;">Settings</h1>
      {:else}
      <h1 class="unselected_text"style="margin: 0px 4px; top: -6px;">설정</h1>
      {/if}
		{/if}
	{:else if selected_screen === 'device'}
		{#if d.pos === 0}
			<Icon src={AiOutlineHome} className="icon down" size="50"/>
			{#if english}
			<h1 class="unselected_text"style="margin: 15px; top: -7px; left: -18px;">Home</h1>
      {:else}
      <h1 class="unselected_text"style="margin: 15px; top: -7px;">홈</h1>
      {/if}
		{:else if d.pos === 1}
			<Icon src={IoGrid} className="icon up" size="50"/>
			{#if english}
			<h1 class="selected_text"style="margin: 0px -14px; top: -6px; left: 6px;">Device</h1>
      {:else}
      <h1 class="selected_text"style="margin: 0px -14px; top: -6px;">디바이스</h1>
      {/if}
		{:else if d.pos === 2}
			<Icon src={AiOutlineSetting} className="icon up" size="50"/>
			{#if english}
			<h1 class="unselected_text"style="margin: 0px 4px; top: -6px; left: -14px;">Settings</h1>
      {:else}
      <h1 class="unselected_text"style="margin: 0px 4px; top: -6px;">설정</h1>
      {/if}
		{/if}
	{:else if selected_screen === 'setting'}
		{#if d.pos === 0}
			<Icon src={AiOutlineHome} className="icon down" size="50"/>
			{#if english}
			<h1 class="unselected_text"style="margin: 15px; top: -7px; left: -18px;">Home</h1>
      {:else}
      <h1 class="unselected_text"style="margin: 15px; top: -7px;">홈</h1>
      {/if}
		{:else if d.pos === 1}
			<Icon src={BsGrid} className="unicon up" size="50"/>
			{#if english}
			<h1 class="unselected_text"style="margin: 0px -14px; top: -6px; left: 3px;">Device</h1>
      {:else}
      <h1 class="unselected_text"style="margin: 0px -14px; top: -6px;">디바이스</h1>
      {/if}
		{:else if d.pos === 2}
			<Icon src={AiFillSetting} className="icon up" size="50"/>
			{#if english}
			<h1 class="selected_text"style="margin: 0px 4px; top: -6px; left: -14px;">Settings</h1>
      {:else}
      <h1 class="selected_text"style="margin: 0px 4px; top: -6px;">설정</h1>
      {/if}
		{/if}
	{/if}
	</button>
	{/each}
</div>

<!-- ----------------------------------------------------------------------스타일------------------------------------------------------------------------------------ -->
<style>
	*{
		position: relative;
	}
	:global(html.dark) h1 {
		color: #FFF;
	}
	:global(html.dark) .frame {
		background-image: linear-gradient(135deg, #374861 0%, #1F2937 100%);
	}
	:global(html.dark) .bar {
		background: #1A2534;
	}
	:global(html.dark) .in-condition {
		background: #1F2937;
	}
  :global(html.dark) .cutton {
    background: #1F2937;
  }
  :global(html.dark .battery_more) {
    color: #FFF;
  }
  :global(html.dark .del_button) {
    background: #1F2937;
  }
	:global(html.dark) .selector {
		background: #1F2937;
		border: 1px solid #FFF;
	}
	:global(html.dark .icon, .title_back) {
		color: #FFF;
	}
	:global(html.dark .icon2) {
		color: #FFF;
	}
	:global(html.dark) .battery_box {
		background: #1A2534;
	}
	:global(html.dark) .setting_box{
		background: #1A2534;
		border-top: 1px solid #374861;
		border-bottom: 1px solid #374861;
	}
	:global(html.dark) .setting_title_box {
		background: #1A2534;
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
		background-image: linear-gradient(135deg, #FFF 0%, #EBEBEB 100%);
		background : linear-gradient();
		position: absolute;
		left: 0px;
		top: 0px;
	}
	.selector {
		width: 170px;
		height: 52px;
		background-color: #FFF;
		border: 1px solid #000;
		position: relative;
		left: 110px;
		top: 56px;
		box-shadow: 3px, 3px, 6px, 0px, rgba(0, 0, 0, 0.30);
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
		box-shadow: 10px 10px 15px 0px rgba(0, 0, 0, 0.30);
		margin-left: 50px;
		margin-top: 100px;
	}
	.in-condition {
		width: 240px;
		height: 240px;
		border-radius: 240px;
		background: #FFF;
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

	.add{
		width: 96px;
		height: 96px;
		border-radius: 96px;
		box-shadow: 10px 10px 15px 0px rgba(0, 0, 0, 0.3);
		margin-left: 150px;
		margin-top: 70px;
	}
	.push_message {
		color: #A1A1A1;
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
		color: #FFF;
		text-align: left;
		font-size: 20px;
		font-weight: 700;
		white-space: nowrap;
	}

	.tab_button {
		width: 43px;
		height: 72px;
		border-color: rgba(0, 0, 0, 0.00);
		background: rgba(0, 0, 0, 0.00);
		margin: 8px 40px;
		cursor: pointer;
	}
	.unselected_text {
		color: #FFF;
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
		background: #FFF;
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
		background: #FFF;
		box-shadow: 4px 4px 5px 0px rgba(0, 0, 0, 0.25);
		margin-left: 80px;
		margin-top: 40px;
		margin-bottom: 30px;
	}
	.battery_text {
		color: #5D5D5D;
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
		border-top: 1px solid #D1D1D1;
		border-bottom: 1px solid #D1D1D1;
		background: #FFF;
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
		border-bottom: 1px solid #DFDFDF;
		background: #FFF;
	}
	:global(.title_back) {
		margin-left: 10px;
		margin-bottom: 0px;
		margin-top: 16px;
	}
	.title_back_text {
		color: #A2A2A2;
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
		box-shadow: 5px 5px 5px 0px rgba(0, 0, 0, 0.30);
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
		background: #FFF;
		margin-left: -12px;
		margin-top: -35px;
	}
  :global(.warn) {
    margin-left: 125px;
    margin-bottom: 10px;
  }
</style>