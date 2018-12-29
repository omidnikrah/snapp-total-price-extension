String.prototype.toPersianDigits = function () {
	const id = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
	return this.replace(/[0-9]/g, w => id[+w]);
  }
  document.addEventListener('DOMContentLoaded', async () => {
	try {
	  const key = "user";
	  const calculateElem = document.getElementById("calculate");
	  const loadingElem = document.getElementById("loading");
	  const totalElem = document.getElementById("total");
	  const descriptionElem = document.getElementById("description");
  
	  const tabs = await chrome.tabs.query({
		active: true,
		currentWindow: true
	  });
  
	  const tab = tabs[0];
  
	  const fromPageLocalStore = await chrome.tabs.executeScript(tab.id, {
		code: `localStorage['${key}']`
	  });
  
	  await chrome.storage.local.set({
		[key]: fromPageLocalStore[0]
	  });
	  calculateElem.addEventListener('click', () => {
		calculateElem.disabled = true;
		calculateElem.style.cursor = "default";
		calculateElem.innerText = "داره حساب میکنه";
		loadingElem.style.display = "block";
		totalElem.style.display = "none";
		descriptionElem.style.display = "none";
		chrome.storage.local.get('user', ({user}) => {
  
		  (async () => {
			const token = JSON.parse(user).token;
			const headers = new Headers();
			const url = 'https://web-api.snapp.ir/api/v1/ride/history';
			const query = '?page=';
			let total = 0;
			let page = 1;
  
			headers.append('Authorization', token);
			headers.append('Content-Type', 'application/json');
  
			while (true) {
			  try {
				const response = await fetch(`${url}${query}${page}`, {
				  method: 'GET',
				  headers
				});
				const data = await response.json();
  
				if (data.rides.length === 0) {
				  break;
				}
  
				total += data.rides
				  .filter(({
					latest_ride_status
				  }) => latest_ride_status !== 6 && latest_ride_status !== 7)
				  .map(({
					price
				  }) => price)
				  .reduce((sum, price) => sum + price, 0);
				page += 1;
			  } catch (err) {
				descriptionElem.innerText = `خیلی با اسنپ رفتی و الان بیشتر از ${page-1} ریکوئست نمیتونم بزنم اما اینقدر فعلا به اسنپ پول دادی :)`;
				descriptionElem.style.margin = "-10px 20px 0";
				descriptionElem.style.fontSize = "12px";
				descriptionElem.style.display = "block";
				break;
			  }
			}
			calculateElem.disabled = false;
			calculateElem.style.cursor = "pointer";
			calculateElem.innerText = "دوباره حساب کن";
			total = total / 10;
			loadingElem.style.display = "none";
			totalElem.style.display = "inline-block";
			const numAnim = new CountUp("total", 0, total);
			numAnim.start();
		  })();
		});
	  })
	} catch (err) {
	  console.log(err);
	}
  });
