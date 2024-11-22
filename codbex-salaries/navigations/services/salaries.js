const navigationData = {
    id: 'salaries-navigation',
    label: "Salaries",
    view: "salaries",
    group: "salaries",
    orderNumber: 1000,
    lazyLoad: true,
    link: "/services/web/codbex-salaries/gen/codbex-salaries/ui/Salaries/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }