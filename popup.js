
String.prototype.toPersianDigits = function () {
    var id = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return this.replace(/[0-9]/g, function (w) {
        return id[+w];
    })
}
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const key = "user"

        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const tab = tabs[0]; 

        const fromPageLocalStore = await chrome.tabs.executeScript(tab.id, { code: `localStorage['${key}']` });

		await chrome.storage.local.set({[key]:fromPageLocalStore[0]});
		document.getElementById("calculate").addEventListener('click',function(){
			document.getElementById("calculate").disabled = true;
			document.getElementById("calculate").style.cursor = "default";									
			document.getElementById("calculate").innerText = "داره حساب میکنه";
			document.getElementById("loading").style.display = "block";
			document.getElementById("total").style.display = "none";			
			document.getElementById("description").hidden = true
			chrome.storage.local.get('user', function(items) {

				(async function () {
					const token = JSON.parse(items.user).token;
					const headers = new Headers();
					const url = 'https://web-api.snapp.ir/api/v1/ride/history';
					const query = '?page=';
					let total = 0;
					let page = 1;
				
					headers.append('Authorization', token);
					headers.append('Content-Type', 'application/json');
				
					while (true) {
						const response = await fetch(`${url}${query}${page}`, {
							method: 'GET',
							headers
						});
						const data = await response.json();
				
						if (data.rides.length === 0) {
							break;
						}
				
						total += data.rides
							.filter(it => it.latest_ride_status !== 6 && it.latest_ride_status !== 7)
							.map(it => it.price)
							.reduce((sum, price) => sum + price, 0);
						page += 1;
					}
					document.getElementById("calculate").disabled = false;
					document.getElementById("calculate").style.cursor = "pointer";									
					document.getElementById("calculate").innerText = "دوباره حساب کن";
					total = total / 10;
					document.getElementById("loading").style.display = "none";					
					document.getElementById("total").style.display = "inline-block";
					var numAnim = new CountUp("total", 0, total);
					numAnim.start();
				}());
				
			});
		})
		
    } 
    catch(err) {
        console.log(err);
    }
});