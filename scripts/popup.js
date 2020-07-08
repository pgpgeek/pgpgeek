
window.onload = function() {
    const openpgp = window.openpgp;


const encryptFunction = async () => {
    let tabs = await browser.tabs.query({
      active: true,
      currentWindow: true
    });
    let tabId = tabs[0].id;
    browser.compose.getComposeDetails(tabId).then(async (details) => {
      let message = details.isPlainText ? details.plainTextBody : details.body;
      const public_key = (await openpgp.key.readArmored(document.getElementById("encrypt_select_public_key").value)).keys;
      const options = {
        message: openpgp.message.fromText(message),
        publicKeys: public_key
      };
      console.log(options);
      openpgp.encrypt(options).then(encrypted => {
        let message = encrypted.data;
        browser.runtime.sendMessage({
          tabId,
          message
        });
        setTimeout(() => {
          window.close();
        }, 1500);
        return encrypted
      });
    });
  }
  
  
  const decryptFunction = async () => {
    let tabs = await browser.tabs.query({
      active: true,
      currentWindow: true
    });
    let tabId = tabs[0].id;
    browser.compose.getComposeDetails(tabId).then(async (details) => {
      let message = details.body;
      message = (new DOMParser().parseFromString(message, "text/html")).body.textContent;
      const private_key = (await openpgp.key.readArmored(document.getElementById("decrypt_select_private_key").value)).keys[0]
      if (!private_key.isDecrypted())
        await private_key.decrypt(document.getElementById('decrypt_passphrase').value);
      const options = {
        message: await openpgp.message.readArmored(message),
        privateKeys: [private_key]
      };
      openpgp.decrypt(options).then(plaintext => {
        let message = plaintext.data;
        browser.runtime.sendMessage({
          tabId,
          message
        });
        setTimeout(() => {
          window.close();
        }, 1500);
        return encrypted
      });
    });
  }
  
  
  /*
   *
   *
   *   Settings
   *
   */
  let getKeyManager = function() {
    return new Promise((res, err) => {
      public_keys = browser.storage.local.get().then(keyM => {
        keyM = typeof keyM.keys == 'undefined' ? Object.assign({
          keys: []
        }, keyM) : keyM;
        browser.storage.local.set(keyM);
        return res(keyM)
      });
    });
  };
  
  let displaySettings = function() {
    getKeyManager().then(keyM => {
      // public keys
      let keys_tab = document.getElementById('keys_tab');
      let public_keys_select = document.getElementById('encrypt_select_public_key');
      let private_keys_select = document.getElementById('decrypt_select_private_key');
      keys_tab.textContent = '';
      document.getElementById('new_key_name').value = '';
      document.getElementById('new_key').value = '';
      for (var i in keyM.keys) {
        // settings
        let row = document.createElement('div');
        let row_name = document.createElement('span');
        let row_key = document.createElement('span');
        let row_delete = document.createElement('span');
        let row_generate_public_key = document.createElement('span');

        row_name.textContent = keyM.keys[i].name;
        row_key.textContent = keyM.keys[i].key.replace(/(\n|\t|\r)/g, '').substr(0, 100) + '...';
        row_delete.textContent = 'delete';
        row_generate_public_key.textContent = 'Generate Public Key';
        row.appendChild(row_name);
        row.appendChild(document.createElement('br'));
        row.appendChild(row_key);
        row.appendChild(document.createElement('br'));
        row.appendChild(row_delete);
        row.setAttribute('class', 'key_row ' + (keyM.keys[i].type == 'public' ? 'key_row_public' : ''));
        row_name.setAttribute('class', 'key_row_name');
        row_key.setAttribute('class', 'key_row_key');
        row_delete.setAttribute('class', 'key_row_delete');
        row_generate_public_key.setAttribute('class', 'row_generate_public_key');
        row_delete.addEventListener('click', deleteKey.bind(null, i));
        keys_tab.appendChild(row);
  
        // actions
        let option = document.createElement('option');
        option.value = keyM.keys[i].key;
        if (keyM.keys[i].type == 'public') {
          option.textContent = 'Public Key #' + i + ' ' + keyM.keys[i].name;
          public_keys_select.appendChild(option);
        } else {
          option.textContent = 'Private Key #' + i + ' ' + keyM.keys[i].name;
          private_keys_select.appendChild(option);
        }
      }
    });
  };
  
  let addNewKey = function() {
    getKeyManager().then(keyM => {
      const newKey = {
        name: document.getElementById('new_key_name').value,
        key : document.getElementById('new_key').value,
        type: document.getElementById('new_type_key').value
      };
      console.log(keyM);
      if (newKey.name.length < 5 || newKey.key.length < 5)
        return null;
      keyM.keys.push(newKey);
      browser.storage.local.set(keyM);
      setTimeout(displaySettings, 500);
    });
  
  };
  
  
  let deleteKey = function(idx) {
    getKeyManager().then(keyM => {
      delete keyM.keys[idx];
      browser.storage.local.set(keyM);
      displaySettings();
    });
  
  };
  
  
  let generateAndAddPublicKey = async () => {
    const html = document.getElementsByTagName('html')[0]
    private_key = (await openpgp.key.readArmored(document.getElementById("decrypt_select_private_key").value)).keys[0]
    await private_key.decrypt(document.getElementById('decrypt_passphrase').value);
    const public_key = private_key.toPublic().armor();
    clipboard = document.createElement('textarea');
    clipboard.value = public_key;
    html.appendChild(clipboard);
    clipboard.select();
    document.execCommand('copy');
    html.removeChild(clipboard);
    alert("Your public key is copied in your clipboard");
  }
  
  let displayNewPrivateKeyOption = function(evt){
        document.getElementById("new_private_key_block").setAttribute("style", evt.target.value === "private" ? "display:block":"")    
  }

  let displayNewPrivateKeyOptionGenerate = function(evt){
    document.getElementById("new_private_key_block_enable").setAttribute("style", evt.target.checked ? "display:block":"")    
  }

  let generateNewPrivateKey = function(){
    if (document.getElementById("new_private_key_block_generate_name").value < 5 ||
        document.getElementById("new_private_key_block_generate_email").value < 5 ||
        document.getElementById("new_private_key_block_generate_passphrase").value < 5)
        return -1;
    const options = {
        userIds: [{ 
            name    : document.getElementById("new_private_key_block_generate_name").value, 
            email   : document.getElementById("new_private_key_block_generate_email").value
        }],
        curve: "ed25519",
        passphrase: document.getElementById("new_private_key_block_generate_passphrase").value
    };
    openpgp.generateKey(options).then(function(key) {
        document.getElementById("new_key").value = key.privateKeyArmored;
    });
  }

  document.getElementById("new_private_key_block_generate_button").addEventListener("click", generateNewPrivateKey)
  document.getElementById("new_private_key_block_generate_checkbox").addEventListener("click", displayNewPrivateKeyOptionGenerate);
  document.getElementById("new_type_key").addEventListener("click", displayNewPrivateKeyOption);
  document.getElementById("add_new_key_button").addEventListener("click", addNewKey);
  document.getElementById("generate_public_key_to_mail").addEventListener("click", generateAndAddPublicKey);
  
  
  displaySettings();
  
  /*
   *
   *   Actions
   *
   */
  document.getElementById("crypt").addEventListener("click", encryptFunction);
  document.getElementById("decrypt").addEventListener("click", decryptFunction);
  
  async function checkAnswer(val) {
    console.log('ploooooop');
    let tabs = await browser.tabs.query({
      active: true,
      currentWindow: true
    });
    let tabId = tabs[0].id;
    let action = val;
    browser.runtime.sendMessage({
      tabId,
      action
    });
  
    setTimeout(() => {
      window.close();
    }, 1500);
  }
}