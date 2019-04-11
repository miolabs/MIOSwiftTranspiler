//
//  UIColor.swift
//  NativePlayerSDL
//
//  Created by Geordie Jay on 16.05.17.
//  Copyright © 2017 Geordie Jay. All rights reserved.
//
//import SDL
import Foundation
import UIKit

public class UIColor: Hashable {
  let red: UInt8
  let green: UInt8
  let blue: UInt8
  let alpha: UInt8
  
  convenience init(hex: Int, alpha: CGFloat = 1) {
    let red = (hex & 0xFF0000) >> 16
    let green = (hex & 0x00FF00) >> 8
    let blue = (hex & 0x0000FF)
    self.init(red: CGFloat(red) / 255, green: CGFloat(green) / 255, blue: CGFloat(blue) / 255, alpha: alpha)
  }
  
  public init(red: CGFloat, green: CGFloat, blue: CGFloat, alpha: CGFloat) {
    self.red = UInt8(min(max(red, 0), 1) * 255)
    self.green = UInt8(min(max(green, 0), 1) * 255)
    self.blue = UInt8(min(max(blue, 0), 1) * 255)
    self.alpha = UInt8(min(max(alpha, 0), 1) * 255)
  }
  
  // from wikipedia: https://en.wikipedia.org/wiki/HSL_and_HSV
  // XXX: This is not currently working as it should but it is better than nothing
  // We currently only use this in testing, but whoever needs it for real should have a look at fixing it..
  public convenience init(hue: CGFloat, saturation: CGFloat, brightness: CGFloat, alpha: CGFloat) {
    let c = (1 - ((2 * brightness) - 1).magnitude) * saturation
    let x = c * (1 - (hue.remainder(dividingBy: 2) - 1).magnitude)
    
    let m = brightness - (0.5 * c)
    
    let r: CGFloat
    let g: CGFloat
    let b: CGFloat
    let hueDash = hue * 6
    if hueDash < 1 {
      (r,g,b) = (c,x,0)
    } else if hueDash < 2 {
      (r,g,b) = (x,c,0)
    } else if hueDash < 3 {
      (r,g,b) = (0,c,x)
    } else if hueDash < 4 {
      (r,g,b) = (0,x,c)
    } else if hueDash < 5 {
      (r,g,b) = (x,0,c)
    } else if hueDash < 6 {
      (r,g,b) = (c,0,x)
    } else {
      (r,g,b) = (0,0,0)
    }
    
    self.init(red: r + m, green: g + m, blue: b + m, alpha: alpha)
  }
  
  // FIXME: mocked!
  public init(patternImage: UIImage?) {
    // TODO: define a color object for specified Quartz color reference https://developer.apple.com/documentation/uikit/uicolor/1621933-init
    self.red = 255
    self.green = 255
    self.blue = 255
    self.alpha = 255
  }
  
  public static func == (lhs: UIColor, rhs: UIColor) -> Bool {
    return (lhs.red == rhs.red) && (lhs.green == rhs.green) && (lhs.blue == rhs.blue) && (lhs.alpha == rhs.alpha)
  }
  
  // Initialise from a color struct from e.g. renderer.getDrawColor()
  init(_ tuple: (r: UInt8, g: UInt8, b: UInt8, a: UInt8)) {
    red = tuple.r; green = tuple.g; blue = tuple.b; alpha = tuple.a
  }
  
  public var hashValue: Int {
    return (
      UInt32(red) << 24 +
        UInt32(green) << 16 +
        UInt32(blue) << 8 +
        UInt32(alpha)
      ).hashValue
  }
}

public typealias CGColor = UIColor // They can be the same for us.
extension UIColor {
  public static let black = UIColor(red: 0, green: 0, blue: 0, alpha: 1)
  public static let white = UIColor(red: 1, green: 1, blue: 1, alpha: 1)
  public static let red = UIColor(red: 1, green: 0, blue: 0, alpha: 1)
  public static let green = UIColor(red: 0, green: 1, blue: 0, alpha: 1)
  public static let blue = UIColor(red: 0, green: 0, blue: 1, alpha: 1)
  public static let purple = UIColor(red: 0.5, green: 0, blue: 0.5, alpha: 1)
  public static let orange = UIColor(red: 1, green: 0.5, blue: 0, alpha: 1)
  public static let lightGray = UIColor(red: 2.0 / 3.0, green: 2.0 / 3.0, blue: 2.0 / 3.0, alpha: 1)
  public static let clear = UIColor(red: 0, green: 0, blue: 0, alpha: 0) // as per iOS
  public var cgColor: CGColor {
    return self
  }
  
  public func withAlphaComponent(_ alpha: CGFloat) -> UIColor {
    return UIColor((self.red, self.green, self.blue, UInt8(min(max(alpha, 0), 1) * 255)))
  }
}

/*extension UIColor {
 var sdlColor: SDLColor {
 return SDLColor(r: red, g: green, b: blue, a: alpha)
 }
 }*/

extension UIColor: CustomStringConvertible {
  public var description: String {
    return "rgba(\(red), \(green), \(blue), \(alpha))"
  }
}
