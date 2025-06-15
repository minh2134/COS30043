const courseData = [
	{code:'ICT10001', desc:'Problem Solving with ICT', cp:12.5, type:'Core'},
	{code:'COS10005', desc:'Web Development', cp:12.5, type:'Core'},
	{code:'INF10003', desc:'Introduction to Business Information Systems', cp:12.5, type:'Core'},
	{code:'INF10002', desc:'Database Analysis and Design', cp:12.5, type:'Core'},
	{code:'COS10009', desc:'Introduction to Programming', cp:12.5, type:'Core'},
	{code:'INF30029', desc:'Information Technology Project Management', cp:12.5, type:'Core'},
	{code:'ICT30005', desc:'Professional Issues in Information Technology', cp:12.5, type:'Core'},
	{code:'ICT30001', desc:'Information Technology Project', cp:12.5, type:'Core'},
]

const Unit = {
	data() { return { courseData } },
	template:`
		<div>
			<h3>Unit Code: {{ filteredUnits.code }}</h3>
			<ul>
				<li>{{ filteredUnits.code }}</li>
				<li>{{ filteredUnits.desc }}</li>
				<li>{{ filteredUnits.cp }}</li>
				<li>{{ filteredUnits.type }}</li>
			</ul>
		</div>
	`,
	computed: {
		filteredUnits: function() {
			return this.courseData.find(m => 
				m.code.toLowerCase().match(this.$route.params.id.toLowerCase())
			)
		}
	}
}

// router 
const router = VueRouter.createRouter({
	history: VueRouter.createMemoryHistory(),
	routes: [{
		path: '/unit/:id',
		component: Unit
	}],
});

const app = Vue.createApp({ });

app.component('app-lookup2', {
	data() {       
		return {
			courses: courseData.sort((a,b) => {  // sort by description
				return a.desc.localeCompare(b.desc, "en", { sensivity: "base" }); // case insensitivity, optional
			})
		}
	},
	template: `
		<div class="row table-responsive">
				<table class="table table-striped table-hover">
					<thead>
						<tr>
							<th scope="col">Code</th>
							<th scope="col">Description</th>
							<th scope="col">More info</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="course in courses">
							<td>{{ course.code }}</td>
							<td>{{ course.desc }}</td>
							<td><router-link :to="{path: \`/unit/\${course.code}\`}">show details</router-link></td>
						</tr>
					</tbody>
				</table>
			</div>
			<router-view></router-view>
	`
});


app.use(router);
app.mount('#app');
