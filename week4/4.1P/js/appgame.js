// creating new Vue instance
const app = Vue.createApp({  //create a new application instance
	data() {      //data 
		return {
			userNumber: 0,
			target: Math.floor(Math.random() * 100) + 1,
			delta: null,
			givenUp: false
		}
	},
	methods: {
		updateDelta() {
			this.delta = this.userNumber - this.target;
		},
		giveUp() {
			this.givenUp = true;
		},
		reset() {
			this.givenUp = false;
			this.userNumber = 0;
			this.delta = null;
			this.target = Math.floor(Math.random() * 100) + 1;
		}
	}
});

// guess status component, display whether 
app.component('hint', {
	props: ['value'],
	template: '<span>{{ value }}</span>'
});

app.mount('#app');
