class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    console.log('The queryString is:', this.queryString);
  }

  filter() {
    //Creat the quary object
    //filtering
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const quaryObj = JSON.parse(JSON.stringify(this.queryString)); //take a hard copy of request query
    // const excludedFields = ['page', 'sort', 'limit', 'field'];
    // excludedFields.map((ele) => delete quaryObj[ele]);

    let queryStr = JSON.stringify(quaryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    //Sorting
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    }
    return this;
  }

  projection() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
      console.log(fields);
    } else this.query = this.query.select('-__v');
    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
