'use strict';

export default (fun) => {
  try {
    fun();
  } catch (error) {
    console.log(error)
    res.send({
      status: 0,
      message: error.message
    })
  }
}