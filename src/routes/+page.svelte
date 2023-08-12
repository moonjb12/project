<script>
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
	import { Button, Dropdown, DropdownItem } from 'flowbite-svelte';
	import { DarkMode } from 'flowbite-svelte';


	let main_data = [{pos: 0, screen: 'home'}, {pos: 1, screen: 'device'}, {pos: 2, screen: 'setting'}, {pos: 3, screen: 'name'}];
	let position = 0;
	let duration = 200;
	let slideWidth;

	let setting_data = [{pos: 0, screen: 'main'}, {pos: 1, screen: 'lang'}, {pos: 2, screen: 'theme'}];
	let setting_position = 0;
	let setting_slideWidth;

	let battery_list = [{name: '한', charge: 100}, {name : '두글', charge: 75}, {name: '세글자', charge: 50}, {name: '네글자네', charge: 25}, {name: '다섯글자다', charge: 0}, {name: '여섯글자여섯', charge: 63}];

	let battery_count = `배터리 ${battery_list.length + 1}`;

	let selected_screen = main_data[0]['screen'];
	let selected_battery = battery_list[4];

	let dark = false;
</script>

<!-- <div class="cutton"style="left: 390px"/> -->

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
		<button on:click={() => position = 3}>
			<div class="add"style="background: linear-gradient(120deg, hsl({selected_battery.charge + 60}, 100%, 50%) 0%, hsl({selected_battery.charge}, 100%, 50%) 100%);">
				<Icon src={FiPlus} size="70" color=white className="plus_stick"/>
				<h1 class="push_message">버튼을 눌러 기기 추가</h1>
			</div>
		</button>
	{:else if d.pos === 1}
	<!-- ----------------------------------------------------------------------디바이스------------------------------------------------------------------------------------ -->
		<div>
			<h1 class="title"style="margin-left: 40px; margin-top: 50px;">디바이스</h1>
			<Icon src={FiPlus} size="30" className="icon2 plus" />
			<Icon src={FiMoreVertical} className="icon2 more menu" />
			<Dropdown>
				<DropdownItem class="menuitem">편집</DropdownItem>
			</Dropdown>
		</div>
		<div class="scroll">
		{#each battery_list as b}
			<div class="battery_box">
				<h1 class="battery_name"style="text-align: left; margin-left: 20px; top: 10px;">{b.name}</h1>
				<Icon src={FiMoreVertical} size="20" className="battery_more menu"/>
				<Dropdown>
					<DropdownItem class="menuitem">이름바꾸기</DropdownItem>
					<DropdownItem class="menuitem"style="color: red;">삭제</DropdownItem>
				</Dropdown>
				<h1 class="battery_text">충전 상태 : {`${b.charge}%`}</h1>
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
				<h1 class="title"style="margin-left: 40px; margin-top: 50px;">설정</h1>
				<div>
					<button on:click={() => setting_position = 1}>
						<div class="setting_box"style="margin-top: 60px;">
							<h1 class="setting_title">테마</h1>
							<h1 class="setting_sample"style="margin-top: -20px;">{dark ? '어두운 화면' : '밝은 화면'}</h1>
							<Icon src={BiChevronRight} size="50" className="setting_next" color="#818181"/>
						</div>
					</button>
					<button on:click={() => setting_position = 2}>
						<div class="setting_box">
							<h1 class="setting_title">언어</h1>
							<h1 class="setting_sample"style="">한국어</h1>
							<Icon src={BiChevronRight} size="50" className="setting_next" color="#818181"/>
						</div>
					</button>
				</div>
			{:else if sd.pos === 1}
				<div class="setting_title_box">
					<button on:click={() => setting_position = 0}>
						<Icon src={BiChevronLeft} size="30" color="#818181" className="title_back"/>
						<h1 class="title_back_text">뒤로</h1>
					</button>
					<h1 class="setting_title_text">테마</h1>
				</div>
				<div>
					<div class="setting_box" style="margin-top: 60px;">
						<h1 class="setting_text">아이콘을 눌러 테마 변경</h1>
						<button class="darkmode_button"on:click={() => {dark = !dark}}>
							<DarkMode class="darkmode"/>
						</button>
					</div>
				</div>
			{:else if sd.pos === 2}
				<div class="setting_title_box">
					<button on:click={() => setting_position = 0}>
						<Icon src={BiChevronLeft} size="30" color="#818181" className="title_back"/>
						<h1 class="title_back_text">뒤로</h1>
					</button>
					<h1 class="setting_title_text">언어</h1>
				</div>
			{/if}
		</div>
		{/each}
	{:else if d.pos === 3}
	<input bind:value={battery_count}/>
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
			<h1 class="selected_text"style="margin: 15px; top: -7px;">홈</h1>
		{:else if d.pos === 1}
			<Icon src={BsGrid} className="unicon up" size="50"/>
			<h1 class="unselected_text"style="margin: 0px -14px; top: -6px;">디바이스</h1>
		{:else if d.pos === 2}
			<Icon src={AiOutlineSetting} className="icon up" size="50"/>
			<h1 class="unselected_text"style="margin: 0px 4px; top: -6px;">설정</h1>
		{/if}
	{:else if selected_screen === 'device'}
		{#if d.pos === 0}
			<Icon src={AiOutlineHome} className="icon down" size="50"/>
			<h1 class="unselected_text"style="margin: 15px; top: -7px;">홈</h1>
		{:else if d.pos === 1}
			<Icon src={IoGrid} className="icon up" size="50"/>
			<h1 class="selected_text"style="margin: 0px -14px; top: -6px;">디바이스</h1>
		{:else if d.pos === 2}
			<Icon src={AiOutlineSetting} className="icon up" size="50"/>
			<h1 class="unselected_text"style="margin: 0px 4px; top: -6px;">설정</h1>
		{/if}
	{:else if selected_screen === 'setting'}
		{#if d.pos === 0}
			<Icon src={AiOutlineHome} className="icon down" size="50"/>
			<h1 class="unselected_text"style="margin: 15px; top: -7px;">홈</h1>
		{:else if d.pos === 1}
			<Icon src={BsGrid} className="unicon up" size="50"/>
			<h1 class="unselected_text"style="margin: 0px -14px; top: -6px;">디바이스</h1>
		{:else if d.pos === 2}
			<Icon src={AiFillSetting} className="icon up" size="50"/>
			<h1 class="selected_text"style="margin: 0px 4px; top: -6px;">설정</h1>
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
		font-family: Noto Sans;
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
		font-family: Noto Sans;
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
		font-family: Noto Sans;
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
		font-family: Noto Sans;
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
		font-family: Noto Sans;
		font-size: 20px;
		font-weight: 400;
		white-space: nowrap;
	}

	.title {
		color: #000;
		text-align: left;
		font-family: Noto Sans;
		font-size: 40px;
		font-weight: 500;
		white-space: nowrap;
	}
	.cutton {
		width: 500px;
		height: 900px;
		background: #FFF;
		z-index: 10;
		position: absolute;
	}
	:global(.more) {
		position: relative;
		margin-left: 350px;
		margin-top: -30px;
	}
	:global(.battery_more) {
		position: relative;
		margin-left: 190px;
		top: -16px;
	}
	:global(.plus) {
		position: relative;
		margin-left: 310px;
		margin-top: -40px;
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
		font-family: Noto Sans;
		font-size: 15px;
		font-weight: 400;
		white-space: nowrap;
		margin-left: 20px;
		margin-top: -8px;
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
		font-family: Noto Sans;
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
		font-family: Noto Sans;
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
		font-family: Noto Sans;
		font-size: 15px;
		font-weight: 500;
		margin-left: 30px;
		margin-top: -29px;
	}
	.setting_title_text {
		color: #000;
		text-align: center;
		font-family: Noto Sans;
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
		font-family: Noto Sans;
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
</style>