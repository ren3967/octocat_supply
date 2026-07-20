Feature: Cart page management
  As a supply chain planner
  I want to review and manage items in my cart
  So that I can confirm shipping costs and totals before checkout

  Scenario: View an empty cart
    Given I have no items in my cart
    When I open the cart from the navigation
    Then I land on the cart page
    And I see the heading "Cart"
    And I see the empty cart message "Your cart is empty"
    And the checkout button is disabled

  Scenario: Add products from the catalog and review the cart
    Given I am viewing the product catalog
    When I add 2 "PawTrack Smart Collar" items to my cart
    And I open the cart from the navigation
    Then the cart icon shows 2 items
    And the cart contains 2 "PawTrack Smart Collar" items
    And the subtotal is "$159.98"
    And the shipping fee is "Free"
    And the total is "$159.98"

  Scenario: Update quantities from the cart page
    Given my cart contains 1 "PawTrack Smart Collar"
    When I increase the quantity of "PawTrack Smart Collar" to 2
    Then the line item quantity for "PawTrack Smart Collar" is 2
    And the line item total is "$159.98"
    And the shipping fee is "Free"
    And the total is "$159.98"

  Scenario: Remove the final item from the cart
    Given my cart contains 1 "PawTrack Smart Collar"
    When I remove "PawTrack Smart Collar" from the cart
    Then I see the empty cart message "Your cart is empty"
    And the cart icon shows 0 items

  Scenario Outline: Apply shipping based on the subtotal threshold
    Given my cart contains <quantity> "<product>"
    When I open the cart from the navigation
    Then the subtotal is "<subtotal>"
    And the shipping fee is "<shipping>"
    And the total is "<total>"

    Examples:
      | product               | quantity | subtotal | shipping | total   |
      | ThermoNest Deluxe     | 1        | $99.99   | $25.00   | $124.99 |
      | PawTrack Smart Collar | 2        | $159.98  | Free     | $159.98 |

  Scenario: Keep quantity at the minimum allowed value
    Given my cart contains 1 "PawTrack Smart Collar"
    When I view the cart page
    Then the decrease quantity control for "PawTrack Smart Collar" is disabled
    And the line item quantity for "PawTrack Smart Collar" is 1

  Scenario: Remove an unavailable saved item
    Given my saved cart contains an unavailable item
    When I open the cart from the navigation
    Then I see the message '"Legacy Laser Toy" is no longer available'
    And I can remove the unavailable item from the cart

  Scenario: Adjust quantity using only the keyboard
    Given my cart contains 1 "PawTrack Smart Collar"
    When I tab to the increase quantity control for "PawTrack Smart Collar"
    And I press the Space key
    Then the line item quantity for "PawTrack Smart Collar" is 2
    And the shipping fee is "Free"
