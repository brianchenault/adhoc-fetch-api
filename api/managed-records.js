import fetch from "../util/fetch-fill";
import URI from "urijs";

// records endpoint
window.path = "http://localhost:3000/records";

const primaryColors = ['red', 'blue', 'yellow'];

const getIds = items => items.map(item => item.id)

const getUriWithParams = (options) => {
  const uri = new URI(window.path);
  uri.addSearch("limit", 10);
  uri.addSearch("offset", getOffset(options.page));

  if (options.colors) {
    options.colors.forEach(color => uri.addSearch('color[]', color));
  }

  return uri;
}

const getOffset = page => page && page > 1 ? (page * 10) - 10 : 0;

const getOpenItems = items =>
  items
    .filter(item => item.disposition === 'open')
    .map(item => ({...item, isPrimary: primaryColors.includes(item.color)}))

const getClosedPrimaryCount = items =>
  items
    .filter(item =>
      item.disposition === 'closed' &&
      primaryColors.includes(item.color)
    )
    .length

const transformResponse = (response, optionsPage) => {
  const hasPage = optionsPage && optionsPage > 0;
  const page = hasPage ? optionsPage : 1;
  return response.length > 0 ? {
    ids: getIds(response),
    open: getOpenItems(response),
    closedPrimaryCount: getClosedPrimaryCount(response),
    previousPage: page > 1 ? page - 1 : null,
    nextPage: page < 50 ? page + 1 : null
  } : {
    ids: [],
    open: [],
    closedPrimaryCount: 0,
    previousPage: page > 50 ? page - 1 : null,
    nextPage: null,
}}

function retrieve (options = { page: null, colors: null }) {
  return new Promise((resolve, reject) => {
    fetch(getUriWithParams(options))
      .then(response => {
        if (response.status !== 200) {
          throw new Error(`Received response code ${response.status} from server.`);
        } else {
          return response.json();
        }
      })
      .then(response => resolve(
        transformResponse(response, options.page)
      ))
      .catch((error) => {
        console.log(error);
        resolve([]);
      });
  });
}

export default retrieve;
