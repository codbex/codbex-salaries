const widgetData = {
    id: 'salaries-sum-widget',
    label: 'Salaries Sum',
    link: '/services/web/codbex-salaries/widgets/salaries-sum/index.html',
    lazyLoad: true,
    size: "small"
};

function getWidget() {
    return widgetData;
}

if (typeof exports !== 'undefined') {
    exports.getWidget = getWidget;
}

export { getWidget }