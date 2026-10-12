### Principle

A common experiment in science education consists of setting a pendulum oscillating and measuring its half-period using an optical gate placed at its equilibrium position. In addition to providing a way to relate the period to the Earth's gravitational field, this experiment highlights one of the anharmonic effects of such an oscillator: the dependence of the period on the initial angle.

The simulation reproduces this experiment virtually, taking air resistance into account through a damping coefficient \(\gamma\). The plotted curve corresponds to the theoretical trajectory for \(\gamma = 0\).



https://github.com/user-attachments/assets/c4fa39d9-f223-413a-b124-b044758f00f2



### Interactions

**Keyboard controls**

* Tab to stop the pendulum and clear the plotted points
* R to slow down the simulation (for increased precision)
* S to take a screenshot

**Mouse controls**

* Click and drag the slider to adjust the damping
* Click and drag the pendulum to set its initial state

### Numerical Method

The pendulum's motion is modeled using the differential equation

\[
\ddot{\theta}+\frac{1}{2}\gamma|\dot{\theta}|\dot{\theta}+\omega_0^2\sin(\theta)=0
\]

where \(\omega_0=\sqrt{g/\ell}\) is the pendulum's natural angular frequency, and \(\gamma\) is a damping coefficient accounting for air resistance (assumed to be quadratic in velocity).

This differential equation is integrated numerically using the Verlet method, with a time step equivalent to 2 ms in slow-motion mode.




