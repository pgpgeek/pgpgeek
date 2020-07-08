//tabs
$('#actions-tab').addEventListener('click',     displayTab.bind(null,   '#box-actions'));
$('#settings-tab').addEventListener('click',    displayTab.bind(null,   '#box-settings'));
$('#others-tab').addEventListener('click',      displayTab.bind(null,   '#box-others'));

// settings
$('#new_private_key_block_generate_button').addEventListener('click', generateNewPrivateKey)
$('#new_private_key_block_generate_checkbox').addEventListener('click', displayNewPrivateKeyOptionGenerate);
$('#new_type_key').addEventListener('click', displayNewPrivateKeyOption);
$('#add_new_key_button').addEventListener('click', addNewKey);
$('#generate_public_key_to_mail').addEventListener('click', generateAndAddPublicKey);

// actions
$('#crypt').addEventListener('click', encryptFunction);
$('#decrypt').addEventListener('click', decryptFunction);