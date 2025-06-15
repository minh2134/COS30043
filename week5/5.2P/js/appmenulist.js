// creating new Vue instance
const app = Vue.createApp({ });

app.component('mymenu', {
	props: ['menu'],
	template: `
			<div class="row">
				<ul>
					<li v-for="item in menu">
						{{ item }}
					</li>
				</ul>
			</div>
	`,
});

app.mount('#app');
