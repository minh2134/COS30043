// creating new Vue instance
const app = Vue.createApp({ });

app.component('app-mypost', {
	data: function() {
		return {
			statPosts:[],
			strStatus:''
		}
	},
	template: `
			<div>
				<label class="me-2"><b>Status:</b> <input type="text" id="numberguess" v-model="strStatus"></label>
				<button v-on:click="add(strStatus)">Post</button>
			</div>
			<div class="row">
						<div class="mt-2" v-for="(status, index) in statPosts">
							<span>{{ status }}</span> <button v-on:click="remove(index)">Del</button>
						</div>
			</div>
	`,
	methods: {
		add: function(status) {
			// push status into statPosts array
			this.statPosts.push(status)
		},
		remove: function(index) {
			// delete status from statPost using index
			this.statPosts.splice(index, 1)
		}
	}
});

app.mount('#app');
