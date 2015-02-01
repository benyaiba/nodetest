function AOP(){
    
}

AOP.before = function(targetContext, targetMethod, aspects){
    return function(){
        
        // call the before aspects
        arguments = Array.prototype.slice.call(arguments);
        var originArguments = arguments;
        for(var i=0;i< aspects.length; i++){
            var aspect = aspects[i];
            var aspectContext = aspect.context;
            var method = aspectContext[aspect.methodName];
            arguments = method.apply(aspectContext, arguments);
            if(!arguments){
                // no return value,use the origin arguments
                arguments = originArguments;
            }
            if(!arguments instanceof Array){
                // retrun value is not array, change to array
                arguments = [arguments];
            }
        }
        
        // call the original method
        arguments = Array.prototype.slice.call(arguments);
        targetMethod.apply(targetContext, arguments);
    };
    
};

exports.AOP = AOP;