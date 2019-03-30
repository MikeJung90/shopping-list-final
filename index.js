'use strict';
/* global $ cuid */

// STORE is storing the data of an array objects 
// 
const STORE = {
  items: [
    // id is being pulled from library 'cuid'
    // name is set with default items initially till add with new input
    // checked is set false to show the items without being checked, true is vice versa
    // isEditing is set false to 
    {id: cuid(), name: 'apples', checked: false, isEditing: false},
    {id: cuid(), name: 'oranges', checked: false, isEditing: false},
    {id: cuid(), name: 'milk', checked: true, isEditing: false},
    {id: cuid(), name: 'bread', checked: false, isEditing: false}
  ],
  // initially set hideCompleted to false, 
  hideCompleted: false,
  searchTerm: null,
};

// creates item element with the inputted data
function generateItemElement(item) {
  let itemMainTitle;
  if (item.isEditing) {
    itemMainTitle = `
      <form id="edit-item-name-form">
        <input type="text" name="edit-name" class="js-edit-item-name" value="${item.name}" />
      </form>
    `;
  } else {
    itemMainTitle = `
      <span class="shopping-item js-shopping-item ${item.checked ? 'shopping-item__checked' : ''}">
        ${item.name}
      </span>`;
  }

  const disabledStatus = item.isEditing ? 'disabled' : '';

  // returning the list with data items
  return `
    <li data-item-id="${item.id}">
      ${itemMainTitle}
      <div class="shopping-item-controls">
        <button class="shopping-item-toggle js-item-toggle" ${disabledStatus}>
            <span class="button-label">check</span>
        </button>
        <button class="shopping-item-delete js-item-delete" ${disabledStatus}>
            <span class="button-label">delete</span>
        </button>
      </div>
    </li>`;
}

// generates the shopping list with the elements needed from each item
function generateShoppingItemsString(shoppingList) {
  // changes all the listed items and inputs generated item element to the items
  const items = shoppingList.map((item) => generateItemElement(item));
  // combines all the elements together without spaces inbetween the element
  return items.join('');
}

// render the shopping list in the DOM
function renderShoppingList() {

  // set up a copy of the store's items in a local variable that we will reassign to a new
  // version if any filtering of the list occurs
  let filteredItems = STORE.items;

  // if the 'hideCompleted' property is true, then we want to reassign filteredItems to a version
  // where ONLY items with a "checked" property of false are included
  if (STORE.hideCompleted) {
    filteredItems = filteredItems.filter(item => !item.checked);
  }

  // Make sure the search form input matches the current STORE entry
  $('.js-search-term').val(STORE.searchTerm);

  // if 'searchTerm' property is not null, then we want to reassign filteredItems to a version that
  // scans the item name for the searchTerm substring
  if (STORE.searchTerm) {
    filteredItems = filteredItems.filter(item => item.name.includes(STORE.searchTerm));
  }

  // send 'filteredItems' into our HTML generation function 
  const shoppingListItemsString = generateShoppingItemsString(filteredItems);

  // insert that HTML into the DOM
  $('.js-shopping-list').html(shoppingListItemsString);
}

// creates new object to be added as last in the list
function addItemToShoppingList(itemName) {
  STORE.items.push({id: cuid(), name: itemName, checked: false, isEditing: false});
}

// when the submit is triggered, it will take the new item from input and 
// send it to 'addItemToShoppingList' 
function handleNewItemSubmit() {
  $('#js-shopping-list-form').submit(function(event) {
    event.preventDefault();
    const newItemName = $('.js-shopping-list-entry').val();
    // reset the input box back to open string
    $('.js-shopping-list-entry').val('');
    // the new entry from input box is send to 'addItemToShoppingList'
    addItemToShoppingList(newItemName);
    // render the updated shopping list
    renderShoppingList();
  });
}

// send information to STORE and put the '.checked' as either true or false
function toggleCheckedForListItem(itemId) {
  const item = STORE.items.find(item => item.id === itemId);
  item.checked = !item.checked;
}

// gets the item that is closest from 'li' and 'item-id'
function getItemIdFromElement(item) {
  return $(item)
    .closest('li')
    .data('item-id');
}

// when the button for checked is clicked send the information to 'toggleCheckedForListItem'
// and once the information goes thru 'toggleCheckedForListItem' pass this to 'renderShoppingList'
function handleItemCheckClicked() {
  // use event delegation on click
  $('.js-shopping-list').on('click', '.js-item-toggle', event => {
    // get item in STORE
    const id = getItemIdFromElement(event.currentTarget);
    // check the item
    toggleCheckedForListItem(id);
    // render the updated shopping list
    renderShoppingList();
  });
}

// delete a list item
function deleteListItem(itemId) {
  // find the index of the item with the specified id using the native .findIndex() method.
  // then we call '.splice' at the index of the list item we want to remove, with a removeCount of 1.
  const itemIndex = STORE.items.findIndex(item => item.id === itemId);
  STORE.items.splice(itemIndex, 1);
}

function handleDeleteItemClicked() {
  // like in 'handleItemCheckClicked', we use event delegation
  $('.js-shopping-list').on('click', '.js-item-delete', event => {
    // get the index of the item in STORE
    const itemIndex = getItemIdFromElement(event.currentTarget);
    // delete the item
    deleteListItem(itemIndex);
    // render the updated shopping list
    renderShoppingList();
  });
}

// toggles the STORE.hideCompleted property
function toggleHideFilter() {
  STORE.hideCompleted = !STORE.hideCompleted;
}

// Places an event listener on the checkbox for hiding completed items
function handleToggleHideFilter() {
  $('.js-hide-completed-toggle').on('click', () => {
    // toggles the hide property
    toggleHideFilter();
    // render the updated shopping list
    renderShoppingList();
  });
}

// Sets STORE.searchTerm to inputted param
function setSearchTerm(searchTerm) {
  STORE.searchTerm = searchTerm;
}

// Places an event listener on the search form to filter the item list
function handleSearchSubmit() {
  $('#js-search-term-form').on('submit', event => {
    event.preventDefault();
    const searchTerm = $('.js-search-term').val();
    setSearchTerm(searchTerm);
    renderShoppingList();
  });
}

// Places an event listener on the search term clear button to clear the input
function handleSearchClear() {
  $('#search-form-clear').on('click', () => {
    setSearchTerm('');
    renderShoppingList();
  });
}

// sets
function setItemIsEditing(itemId, isEditing) {
  // targetItem is STORE's items with item id tag and set them as itemId
  const targetItem = STORE.items.find(item => item.id === itemId);
  // sets item as isEditing prop
  targetItem.isEditing = isEditing;
}

// Place an event listener on an item name to set to editing mode
function handleItemNameClick() {
  $('.js-shopping-list').on('click', '.js-shopping-item', event => {
    const id = getItemIdFromElement(event.target);
    setItemIsEditing(id, true);
    renderShoppingList();
  });
}

// finds and edits item name at specified id
function editItemName(itemId, newName) {
  const targetItem = STORE.items.find(item => item.id === itemId);
  targetItem.name = newName;
}

// Place an event listener on the edit item name form
function handleEditItemForm() {
  $('.js-shopping-list').on('submit', '#edit-item-name-form', event => {
    event.preventDefault();
    const id = getItemIdFromElement(event.target);
    const newName = $('.js-edit-item-name').val();
    editItemName(id, newName);
    setItemIsEditing(id, false);
    renderShoppingList();
  });
}

// this function will be our callback when the page loads. it's responsible for
// initially rendering the shopping list, and activating our individual functions
// that handle new item submission and user clicks on the "check" and "delete" buttons
// for individual shopping list items.
function handleShoppingList() {
  renderShoppingList();
  handleNewItemSubmit();
  handleItemCheckClicked();
  handleDeleteItemClicked();
  handleToggleHideFilter();
  handleSearchSubmit();
  handleSearchClear();
  handleItemNameClick();
  handleEditItemForm();
}

// when the page loads, call `handleShoppingList`
$(handleShoppingList);
