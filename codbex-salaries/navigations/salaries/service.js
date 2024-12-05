const navigationData = {
    id: 'salaries-navigation',
    label: "Salaries",
    group: "salaries",
    order: 100,
    link: "/services/web/codbex-salaries/gen/codbex-salaries/ui/Salaries/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }


