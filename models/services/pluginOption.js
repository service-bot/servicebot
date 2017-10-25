class PluginOption{
    constructor(getter, setter, name, type,  widgetType, visible=false){
        this.getOption = getter;
        this.setOption = setter;
        this.data = {
            option : name,
            data_type : widgetType,
            type,
            "public" : visible,
        }
        this.name = name;
        this.type = type;
        this.widgetType = widgetType;
        this.visible = visible;
    }
}
module.exports = PluginOption;