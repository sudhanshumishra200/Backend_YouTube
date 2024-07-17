const asyncHandler = function (reqestHandler) {
    return  function (req, res, next){
        Promise.resolve(reqestHandler(req, res, next)).catch(function (err) {
            next(err)
         })
    }
}



export default asyncHandler ;





// to understand high o fn
// function createMultiplier(multiplier) {
//     return function (num) {
//         return num * multiplier;
//     };
// }

// const double = createMultiplier(2);
// const triple = createMultiplier(3);

// console.log(double(5)); // Output: 10
// console.log(triple(5)); // Output: 15

// const asyncHandler = (fn) => { () => {}}
// we will just remove the extra brackets 



// we are just writing the wrapper fn which we can use everywhere to just wrap any function
// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// };
