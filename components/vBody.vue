<template>
	<div class="game__body body-game">
		<div class="body-game__container _container">
			<div class="body-game__player player">
				<div class="player__name fas fa-user" :class="{_active: isSecondPlayerTurn}">{{ mode === 'single-player' ? "Bot" : "Player 2" }}</div>
				<div class="player__count">Count: {{ secondPlayerCount }}</div>
			</div>
			<v-board></v-board>
			<div class="body-game__player player">
				<div class="player__name fas fa-user" :class="{_active: isFirstPlayerTurn}">Player 1</div>
				<div class="player__count">Count: {{ firstPlayerCount }}</div>
			</div>
		</div>
	</div>
</template>

<script>
import vBoard from '@/components/vBoard';
import { mapGetters } from 'vuex';
export default {
	name: "vBody",
	computed: {
		...mapGetters([
			'firstPlayerCount', 
			'secondPlayerCount',
			'mode',
			'isSecondPlayerTurn',
			'isFirstPlayerTurn'
		]),
	},
	components: {
		vBoard
	}
}
</script>