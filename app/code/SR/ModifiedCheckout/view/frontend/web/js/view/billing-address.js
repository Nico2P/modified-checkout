/*jshint browser:true*/
/*global define*/
define(
    [
        'ko',
        'underscore',
        'jquery',
        'Magento_Ui/js/form/form',
        'Magento_Customer/js/model/customer',
        'Magento_Customer/js/model/address-list',
        'Magento_Checkout/js/model/quote',
        'Magento_Checkout/js/action/create-billing-address',
        'Magento_Checkout/js/action/select-billing-address',
        'Magento_Checkout/js/checkout-data',
        'Magento_Checkout/js/model/checkout-data-resolver',
        'Magento_Customer/js/customer-data',
        'Magento_Checkout/js/action/set-billing-address',
        'Magento_Ui/js/model/messageList',
        'mage/translate'
    ],
    function (
        ko,
        _,
        $,
        Component,
        customer,
        addressList,
        quote,
        createBillingAddress,
        selectBillingAddress,
        checkoutData,
        checkoutDataResolver,
        customerData,
        setBillingAddressAction,
        globalMessageList,
        $t

    ) {
        'use strict';

        var newAddressOption = {
                /**
                 * Get new address label
                 * @returns {String}
                 */
                getAddressInline: function () {
                    return $t('New Address');
                },
                customerAddressId: null
            },
            countryData = customerData.get('directory-data'),
            addressOptions = addressList().filter(function (address) {
                return address.getType() == 'customer-address';
            });

        addressOptions.push(newAddressOption);

        return Component.extend({
            defaults: {
                template: 'SR_ModifiedCheckout/billing-address'
            },
            currentBillingAddress: quote.billingAddress,
            addressOptions: addressOptions,
            customerHasAddresses: addressOptions.length > 1,
            test_pouet:1,

            /**
             * Init component
             */
            initialize: function () {
                this._super();
            },

            /**
             * @return {exports.initObservable}
             */
            initObservable: function () {
                this._super()
                    .observe({
                        selectedAddress: null,
                        isAddressFormVisible: false,
                        isAddressSameAsShipping: true,
                        saveInAddressBook: 1,
                        isAddressFormListVisible:false,
                        btnIsAllReadyCreate:false
                    });

                return this;
            },

            canUseShippingAddress: ko.computed(function () {
                return !quote.isVirtual() && quote.shippingAddress() && quote.shippingAddress().canUseForBilling();
            }),

            /**
             * @param {Object} address
             * @return {*}
             */
            addressOptionsText: function (address) {
                return address.getAddressInline();
            },

            /**
             * @return {Boolean}
             */
            useShippingAddress: function () {

                if (this.isAddressSameAsShipping()) {
                    this.isAddressFormVisible(false);
                    this.isAddressFormListVisible(false);
                } else {
                    if(addressOptions.length == 1) {
                        this.isAddressFormVisible(true);
                    } else {
                        this.isAddressFormListVisible(true);

                        //Controle btn déjà crée
                        if (!this.btnIsAllReadyCreate()){

                            for (let i = 0; i < addressOptions.length; i++) {
                                //Loop addresse, création btn et insert dans le DOM
                                let bill = document.getElementsByClassName('checkout-billing-address')[0];
                                let div_addressBillingBlock = document.getElementsByClassName('addressBillingBlock')[0];
                                let id_address;
                                let div = document.createElement('div');

                                if (i === 3){
                                    id_address = null;
                                } else {
                                    id_address = addressOptions[i].customerAddressId;
                                    div.classList.add('shipping-address-item');
                                    div.classList.add('billing-address-item');
                                }

                                div_addressBillingBlock.append(div);

                                if (id_address !== null){
                                    // Création elements
                                    let info_address = document.createElement("div");
                                    let civilite = document.createElement('p');
                                    let street = document.createElement('p');
                                    let city = document.createElement('p');
                                    let country_cust = document.createElement('p');
                                    let phone = addressOptions[i].telephone;
                                    // Bind info to elements
                                    civilite.innerText = addressOptions[i].firstname + ' ' + addressOptions[i].lastname;
                                    street.innerText = addressOptions[i].street;
                                    city.innerText = addressOptions[i].city + ', ' + addressOptions[i].postcode;
                                    country_cust.innerText = "France";
                                    //Insert elements
                                    info_address.append(civilite,street,city,country_cust,phone);
                                    div.append(info_address);
                                }

                                //Création des boutons
                                let btn = document.createElement("button");
                                if (id_address === null){ // Si aucun ID c'est le btn de création d'adresse
                                    btn.innerHTML = " +  Nouvelle adresse";
                                    btn.style.float = 'none';
                                } else {
                                    btn.innerHTML = "Facturer à cette adresse";
                                }
                                //Bind Function OnClick
                                btn.id = id_address;
                                btn.setAttribute('onclick', 'setCustomBillingAddress('+id_address+');');
                                btn.classList.add('action-select-shipping-item');
                                div.append(btn);

                                if (i === 0){
                                    //Trigger la première addresse comme choix
                                    let btn = document.getElementById(id_address);
                                    btn.click();
                                }
                            }
                            //Creation des btn ok
                            this.btnIsAllReadyCreate(true);
                        }
                    }
                }
                return true;
            },
            /**
             * @param {Object} address
             */
            onAddressChange: function (address) {
                if(address) {
                    this.isAddressFormVisible(false);
                } else {
                    this.isAddressFormVisible(true);
                }
            },

            /**
             * @param {int} countryId
             * @return {*}
             */
            getCountryName: function (countryId) {
                return countryData()[countryId] != undefined ? countryData()[countryId].name : '';
            },

            /**
             * Get code
             * @param {Object} parent
             * @returns {String}
             */
            getCode: function (parent) {
                return _.isFunction(parent.getCode) ? parent.getCode() : 'shared';
            }
        });
    }
);
