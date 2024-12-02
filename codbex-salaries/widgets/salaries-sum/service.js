const widgetData = {
    id: 'salaries-sum',
    label: 'Salaries Sum',
    link: '/services/web/codbex-salaries/widgets/salaries-sum/index.html',
    lazyLoad: true,
    size: "medium"
};

function getWidget() {
    return widgetData;
}

if (typeof exports !== 'undefined') {
    exports.getWidget = getWidget;
}

export { getWidget }