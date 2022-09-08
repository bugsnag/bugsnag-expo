Then("the event {string} equals one of:") do |field, expected|
  key_path = "events.0.#{field}"
  value = Maze::Helper.read_key_path(Maze::Server.errors.current[:body], key_path)
  Maze.check.include(expected.raw.flatten, value)
end

Then("the event does not have a {string} breadcrumb named {string}") do |type, name|
  value = Maze::Server.errors.current[:body]["events"].first["breadcrumbs"]
  found = false
  value.each do |crumb|
    if crumb["type"] == type and crumb["name"] == name then
      found = true
    end
  end
  fail("A breadcrumb was found matching: #{value}") if found
end

Then("the event {string} equals the current OS name") do |field_path|
  expected = Maze.driver.capabilities['os']
  key_path = "events.0.#{field_path}"
  actual_value = Maze::Helper.read_key_path(Maze::Server.errors.current[:body], key_path)

  Maze.check.equal(expected, actual_value)
end

def click_if_present(element)
  return false unless Maze.driver.wait_for_element(element, 1)

  Maze.driver.click_element_if_present(element)
rescue Selenium::WebDriver::Error::UnknownError
  # Ignore Appium errors (e.g. during an ANR)
  return false
end

When("I clear any error dialogue") do
  # It can take multiple clicks to clear a dialog,
  # so keep pressing until nothing is pressed
  keep_clicking = true
  while keep_clicking
    keep_clicking = click_if_present('android:id/button1') ||
                    click_if_present('android:id/aerr_close') ||
                    click_if_present('android:id/aerr_restart')
  end
end
