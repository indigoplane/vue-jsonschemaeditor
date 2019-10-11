function getId() {
  let date = Date.now();

  // If created at same millisecond as previous
  if (date <= getId.previous) {
    date = ++getId.previous;
  } else {
    getId.previous = date;
  }

  return date;
}

getId.previous = 0;
export {getId}
export default {
  methods:{
    getId:getId
  }
}
