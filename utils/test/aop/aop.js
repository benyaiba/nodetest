function before(context, targetMethodName, aspectMethod){
    var oldMethod = context[targetMethodName];

    function newMethod() {
        var params = Array.prototype.slice.call(arguments);
        var beforeAspectResult = aspectMethod.apply(context, params);
        var targetParams = beforeAspectResult || params;
        oldMethod.call(context, targetParams);
    }

    context[targetMethodName] = newMethod;
}

exports.before = before;