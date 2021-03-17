(async function(){
	class Reader {
		constructor () {
			this.prefix = '';
			this.enabled = false;
		}

		init () {
			chrome.storage.local.get(['g_meet_tts_prefix', 'g_meet_tts_enabled'], ({ g_meet_tts_prefix, g_meet_tts_enabled }) => {
				this.prefix = g_meet_tts_prefix;
				this.enabled = g_meet_tts_enabled;

				this.enabled && this.start();
			});

			chrome.storage.onChanged.addListener(({ g_meet_tts_prefix, g_meet_tts_enabled }) => {
				if (g_meet_tts_prefix) {
					this.prefix = g_meet_tts_prefix.newValue;
				}

				if (g_meet_tts_enabled) {
					this.enabled = g_meet_tts_enabled.newValue;
					this.enabled ? this.start() : this.stop();
				}
			});

			this.chatObserver = new MutationObserver((mutations, _) => {
				const [node] = (mutations[1] || mutations[0]).addedNodes;

				if (node) {
					let msg;
					let author;
				
					switch (node.className) {
						case 'oIy2qc':
							msg = node.innerText;
							author = node.parentElement.parentElement.getAttribute('data-sender-name');
							break;
						case 'GDhqjd':
							const fTimestamp = node.getAttribute('data-formatted-timestamp')
							if (fTimestamp) {
								[author, ...msg] = node.innerText.replace(fTimestamp, '').split('\n');
								msg = msg.join('\n');
								break;
							}
						default:
							return;
					}
				
					msg.startsWith(this.prefix) && this.speak(`${author} disse: ${msg.substr(this.prefix.length)}`);
				}
			});
		}

		async start () {
			const chat = await (function (reader) {
				return document.getElementsByClassName('z38b6 CnDs7d hPqowe')[0] || new Promise((resolve, reject) => {
					const obs = new MutationObserver(function (mutations) {
						if (!reader.enabled) {
							this.disconnect();
							return resolve();
						}

						for (const mutation of mutations) {
							for (const node of mutation.addedNodes) {
								if (node.className === 'Bx7THd PBWx0c Uy7Qke XN1AMe') {
									this.disconnect();
									return resolve(document.getElementsByClassName('z38b6 CnDs7d hPqowe')[0]);
								}
							}
						}
					});
		
					obs.observe(document.body, { childList: true, subtree: true });
				});
			})(this);

			if (chat) {
				const [closeBtn] = document.getElementsByClassName('VfPpkd-Bz112c-LgbsSe yHy1rc eT1oJ IWtuld wBYOYb');
				if (closeBtn) { closeBtn.style.display = 'none'; }

				this.chatObserver.observe(chat, { childList: true, subtree: true });
			}
		}

		stop () {
			this.chatObserver.disconnect();

			const [closeBtn] = document.getElementsByClassName('VfPpkd-Bz112c-LgbsSe yHy1rc eT1oJ IWtuld wBYOYb');
			if (closeBtn) { closeBtn.style.display = ''; }
		}

		speak (text) {
			const utterance = new SpeechSynthesisUtterance(text);
			return speechSynthesis.speak(utterance);
		}
	}

	const reader = new Reader();
	reader.init();
})();
